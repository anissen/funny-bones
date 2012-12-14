(function() {
  var constraintObjects, dnd, handleDnD, readJson, rigidbody, scene, v, world;

  v = function(x, y, z) {
    return new THREE.Vector3(x, y, z);
  };

  world = null;

  scene = null;

  rigidbody = new RigidBody();

  constraintObjects = [];

  readJson = function(data) {
    var createConstraint, createParticle, lineMat, radius, rings, segments, sphereMaterial;
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
    /*
      particleMap = {}
      _.each data.rigidbody.particle, (p) ->
        sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial)
        p.position.x /= 100
        p.position.y /= 100
        p.position.z /= 100
        #sphere.position = p.position
    
        particle = new Particle p, sphere
        particleMap[p.id] = particle
        scene.add sphere
        window.particle = particle
    
      _.each data.rigidbody.constraint, (c) ->
        p1 = particleMap[c.particle1]
        p2 = particleMap[c.particle2]
        lineGeo = new THREE.Geometry()
        lineGeo.vertices.push v3(p1.settings.position), v3(p2.settings.position)
        line = new THREE.Line(lineGeo, lineMat)
        scene.add line
    */

    createParticle = function(p) {
      var sphereMesh;
      sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
      sphereMesh.position = p.position;
      return sphereMesh;
    };
    createConstraint = function(c, p1, p2) {
      var lineGeo;
      lineGeo = new THREE.Geometry();
      lineGeo.vertices.push(p1.position, p2.position);
      lineGeo.dynamic = true;
      constraintObjects.push(lineGeo);
      return new THREE.Line(lineGeo, lineMat);
    };
    rigidbody.load(data, createParticle, createConstraint);
    return scene.add(rigidbody.getScene());
  };

  $(function() {
    var cube, cubeGeometry, cubeMaterial, groundGeo, groundMesh, groundSize, line, lineGeo, lineLengthHalf, lineMat, options;
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
        _results.push(c.verticesNeedUpdate = true);
      }
      return _results;
    });
    world.start();
    return $.ajax({
      url: 'data/hitman.json',
      dataType: 'JSON',
      type: 'GET'
    }).done(function(data) {
      return readJson(data);
    }).fail(function(err) {
      return alert('Error!!1! ' + err);
    });
  });

  handleDnD = function(files) {
    var f, reader;
    f = files[0];
    if (!f.type.match("application/json")) {
      alert("Not a JSON file!");
    }
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
