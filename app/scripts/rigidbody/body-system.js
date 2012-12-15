(function() {
  var Settings, alignCylinderToParticles, constraintObjects, cylinder, dnd, handleDnD, readJson, rigidbody, scene, settings, v, world;

  v = function(x, y, z) {
    return new THREE.Vector3(x, y, z);
  };

  Settings = function() {
    this.gravity = -9.82;
    this.explode = function() {
      return alert('Bang!');
    };
    return this;
  };

  settings = new Settings();

  world = null;

  scene = null;

  rigidbody = new RigidBody(settings);

  constraintObjects = [];

  window.cylinder = cylinder = null;

  alignCylinderToParticles = function(cylinder, p1, p2) {
    var angle, center, length, rotObjectMatrix, t, z;
    length = p1.position.distanceTo(p2.position);
    v = new THREE.Vector3();
    v = v.sub(p2.position, p1.position);
    center = v.clone().add(p1.position, v.clone().divideScalar(2));
    cylinder.position = center;
    z = new THREE.Vector3(0, 1, 0);
    t = z.clone().cross(z, v);
    angle = Math.acos(z.dot(v) / length);
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(t.normalize(), angle);
    cylinder.matrix = new THREE.Matrix4();
    cylinder.matrix.multiplySelf(rotObjectMatrix);
    return cylinder.rotation.setEulerFromRotationMatrix(cylinder.matrix);
  };

  readJson = function(data) {
    var createCylinderConstraint, createLineConstraint, createParticle, lineMat, radius, rings, segments, sphereMaterial;
    if (scene != null) {
      world.remove(scene);
    }
    scene = new THREE.Scene();
    world.add(scene);
    radius = 1.0;
    segments = 8;
    rings = 8;
    sphereMaterial = new THREE.MeshLambertMaterial({
      ambient: 0xFFFFFF,
      color: 0x0000FF
    });
    lineMat = new THREE.LineBasicMaterial({
      ambient: 0xFFFFFF,
      color: 0xFF0000,
      lineWidth: 1
    });
    createParticle = function(p) {
      var sphereMesh;
      sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
      sphereMesh.position = p.position;
      return sphereMesh;
    };
    createLineConstraint = function(c, p1, p2) {
      var lineGeo;
      lineGeo = new THREE.Geometry();
      lineGeo.vertices.push(p1.position, p2.position);
      lineGeo.dynamic = true;
      constraintObjects.push(lineGeo);
      return new THREE.Line(lineGeo, lineMat);
    };
    createCylinderConstraint = function(c, p1, p2) {
      var cylinderGeo, cylinderLength, cylinderMaterial, cylinderRadius, length;
      length = p1.position.distanceTo(p2.position);
      cylinderRadius = 0.5;
      cylinderLength = length;
      cylinderGeo = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderLength, 6, 1, false);
      cylinderMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: false
      });
      cylinder = new THREE.Mesh(cylinderGeo, cylinderMaterial);
      cylinder.p1 = p1;
      cylinder.p2 = p2;
      constraintObjects.push(cylinder);
      alignCylinderToParticles(cylinder, p1, p2);
      return cylinder;
    };
    rigidbody.load(data, createParticle, createCylinderConstraint);
    return scene.add(rigidbody.getScene());
  };

  $(function() {
    var cube, cubeGeometry, cubeMaterial, groundGeo, groundMesh, groundSize, gui, line, lineGeo, lineLengthHalf, lineMat, options;
    options = {
      cameraControls: true,
      stats: false
    };
    world = threeBox($("#three-placeholder").get(0), options);
    groundSize = 150;
    groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
    groundMesh = new THREE.Mesh(groundGeo, new THREE.MeshBasicMaterial({}));
    groundMesh.rotation.x -= Math.PI / 2;
    groundMesh.position.y -= 0.3;
    world.add(groundMesh);
    cubeGeometry = new THREE.CubeGeometry(groundSize, groundSize, groundSize);
    cubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: true
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.y += groundSize / 2;
    world.add(cube);
    lineLengthHalf = groundSize / 2;
    lineGeo = new THREE.Geometry();
    lineGeo.vertices.push(new THREE.Vector3(-lineLengthHalf, 0, 0), new THREE.Vector3(lineLengthHalf, 0, 0), new THREE.Vector3(0, -lineLengthHalf, 0), new THREE.Vector3(0, lineLengthHalf, 0), new THREE.Vector3(0, 0, -lineLengthHalf), new THREE.Vector3(0, 0, lineLengthHalf));
    lineMat = new THREE.LineBasicMaterial({
      color: 0x000000,
      lineWidth: 2
    });
    line = new THREE.Line(lineGeo, lineMat);
    line.type = THREE.Lines;
    world.add(line);
    tQuery.createAmbientLight().addTo(world).color(0x444444);
    tQuery.createDirectionalLight().addTo(world).position(-1, 1, 1).color(0xFF88BB).intensity(3);
    tQuery.createDirectionalLight().addTo(world).position(1, 1, -1).color(0x4444FF).intensity(2);
    world.loop().hook(function(delta, now) {
      var c, _i, _len, _results;
      if (rigidbody != null) {
        rigidbody.calculate();
      }
      _results = [];
      for (_i = 0, _len = constraintObjects.length; _i < _len; _i++) {
        c = constraintObjects[_i];
        _results.push(alignCylinderToParticles(c, c.p1, c.p2));
      }
      return _results;
    });
    world.start();
    $.ajax({
      url: 'data/hitman.json',
      dataType: 'JSON',
      type: 'GET'
    }).done(function(data) {
      return readJson(data);
    }).fail(function(err) {
      return alert('Error!!1! ' + err);
    });
    gui = new dat.GUI();
    gui.add(settings, 'gravity', -20.0, 20.0);
    return gui.add(settings, 'explode');
  });

  handleDnD = function(files) {
    var f, reader;
    f = files[0];
    reader = new FileReader();
    reader.onloadend = function(e) {
      var result;
      result = JSON.parse(this.result);
      return readJson(result);
    };
    return reader.readAsText(f);
  };

  dnd = new DnDFileController("body", handleDnD);

}).call(this);
