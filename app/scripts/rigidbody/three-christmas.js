(function() {
  var GravitySettings, Settings, alignCylinderToParticles, animate, bevelEnabled, bevelSegments, bevelSize, bevelThickness, camera, cameraTarget, color, constraintObjects, container, createScene, createTextMesh, curveSegments, cylinderMaterial, decimalToHex, effectFXAA, font, glow, height, hex, hover, init, material, mirror, mouseX, mouseXOnMouseDown, onDocumentMouseDown, onDocumentMouseMove, onDocumentMouseOut, onDocumentMouseUp, onDocumentTouchMove, onDocumentTouchStart, onWindowResize, parent, postprocessing, render, renderer, rigidbody, scene, selectedParticle, settings, size, sphereMaterial, stats, style, targetRotation, targetRotationOnMouseDown, text, textGeo, textMesh1, textMesh2, weight, windowHalfX, windowHalfY, world;

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  }

  GravitySettings = function() {
    this.enabled = true;
    this.x = 0.0;
    this.y = -9.82;
    return this.z = 0.0;
  };

  Settings = function() {
    this.gravity = new GravitySettings();
    this.running = true;
    return this;
  };

  settings = new Settings();

  selectedParticle = null;

  world = null;

  scene = null;

  rigidbody = new RigidBody(settings);

  constraintObjects = [];

  sphereMaterial = new THREE.MeshPhongMaterial({
    ambient: 0xFFFFFF,
    color: 0xAA0000,
    specular: 0x555555,
    shininess: 80
  });

  cylinderMaterial = new THREE.MeshPhongMaterial({
    ambient: 0xFFFFFF,
    color: 0x00AA00,
    specular: 0x555555,
    shininess: 10
  });

  container = void 0;

  stats = void 0;

  hex = void 0;

  color = void 0;

  camera = void 0;

  cameraTarget = void 0;

  scene = void 0;

  renderer = void 0;

  effectFXAA = void 0;

  textMesh1 = void 0;

  textMesh2 = void 0;

  textGeo = void 0;

  material = void 0;

  parent = void 0;

  text = "GOD JUL";

  height = 15;

  size = 50;

  hover = 30;

  curveSegments = 4;

  bevelThickness = 2;

  bevelSize = 1.5;

  bevelSegments = 3;

  bevelEnabled = true;

  font = "optimer";

  weight = "bold";

  style = "normal";

  mirror = true;

  targetRotation = 0;

  targetRotationOnMouseDown = 0;

  mouseX = 0;

  mouseXOnMouseDown = 0;

  windowHalfX = window.innerWidth / 2;

  windowHalfY = window.innerHeight / 2;

  postprocessing = {
    enabled: false
  };

  glow = 0.9;

  decimalToHex = function(d) {
    hex = Number(d).toString(16);
    hex = "000000".substr(0, 6 - hex.length) + hex;
    return hex.toUpperCase();
  };

  init = function() {
    var dirLight, plane, pointLight;
    container = document.createElement("div");
    document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500);
    camera.position.set(0, 400, 700);
    cameraTarget = new THREE.Vector3(0, 150, 0);
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x001100, 250, 1400);
    dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
    dirLight.position.set(0, 0, 1).normalize();
    scene.add(dirLight);
    pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(0, 100, 90);
    scene.add(pointLight);
    hex = decimalToHex(pointLight.color.getHex());
    material = new THREE.MeshFaceMaterial([
      new THREE.MeshPhongMaterial({
        color: 0xFF0000,
        shading: THREE.FlatShading
      }), new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        shading: THREE.SmoothShading
      })
    ]);
    parent = new THREE.Object3D();
    parent.position.y = 100;
    scene.add(parent);
    plane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshBasicMaterial({
      color: 0x00FF00,
      opacity: 0.5,
      transparent: true
    }));
    plane.position.y = 0;
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color, 1);
    container.appendChild(renderer.domElement);
    stats = new Stats();
    stats.domElement.style.position = "absolute";
    stats.domElement.style.top = "0px";
    document.addEventListener("mousedown", onDocumentMouseDown, false);
    document.addEventListener("touchstart", onDocumentTouchStart, false);
    document.addEventListener("touchmove", onDocumentTouchMove, false);
    return window.addEventListener("resize", onWindowResize, false);
  };

  onWindowResize = function() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    return renderer.setSize(window.innerWidth, window.innerHeight);
  };

  createTextMesh = function(text) {
    var centerOffset;
    textGeo = new THREE.TextGeometry(text, {
      size: size,
      height: height,
      curveSegments: curveSegments,
      font: font,
      weight: weight,
      style: style,
      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelEnabled: bevelEnabled,
      material: 0,
      extrudeMaterial: 1
    });
    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();
    centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
    textMesh1 = new THREE.Mesh(textGeo, material);
    textMesh1.position.x = centerOffset;
    textMesh1.position.y = -50;
    textMesh1.position.z = -height / 2;
    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = Math.PI * 2;
    container = new THREE.Object3D();
    container.add(textMesh1);
    return container;
  };

  onDocumentMouseDown = function(event) {
    event.preventDefault();
    document.addEventListener("mousemove", onDocumentMouseMove, false);
    document.addEventListener("mouseup", onDocumentMouseUp, false);
    document.addEventListener("mouseout", onDocumentMouseOut, false);
    mouseXOnMouseDown = event.clientX - windowHalfX;
    return targetRotationOnMouseDown = targetRotation;
  };

  onDocumentMouseMove = function(event) {
    mouseX = event.clientX - windowHalfX;
    return targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
  };

  onDocumentMouseUp = function(event) {
    document.removeEventListener("mousemove", onDocumentMouseMove, false);
    document.removeEventListener("mouseup", onDocumentMouseUp, false);
    return document.removeEventListener("mouseout", onDocumentMouseOut, false);
  };

  onDocumentMouseOut = function(event) {
    document.removeEventListener("mousemove", onDocumentMouseMove, false);
    document.removeEventListener("mouseup", onDocumentMouseUp, false);
    return document.removeEventListener("mouseout", onDocumentMouseOut, false);
  };

  onDocumentTouchStart = function(event) {
    if (event.touches.length === 1) {
      event.preventDefault();
      mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
      return targetRotationOnMouseDown = targetRotation;
    }
  };

  onDocumentTouchMove = function(event) {
    if (event.touches.length === 1) {
      event.preventDefault();
      mouseX = event.touches[0].pageX - windowHalfX;
      return targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.05;
    }
  };

  animate = function() {
    requestAnimationFrame(animate);
    render();
    return stats.update();
  };

  render = function() {
    var c, _i, _len;
    parent.rotation.y += (targetRotation - parent.rotation.y) * 0.05;
    if (rigidbody != null) {
      rigidbody.calculate();
    }
    for (_i = 0, _len = constraintObjects.length; _i < _len; _i++) {
      c = constraintObjects[_i];
      alignCylinderToParticles(c, c.p1, c.p2);
    }
    camera.lookAt(cameraTarget);
    renderer.clear();
    return renderer.render(scene, camera);
  };

  alignCylinderToParticles = function(cylinder, p1, p2) {
    var angle, center, length, rotObjectMatrix, t, v, z;
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

  createScene = function() {
    var createChristmasRope, createCylinderConstraint, createParticle, radius, rings, segments;
    radius = 5;
    segments = 8;
    rings = 8;
    createParticle = function(p) {
      var sphereMesh;
      sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
      sphereMesh.position = p.position;
      return sphereMesh;
    };
    createCylinderConstraint = function(c, p1, p2) {
      var cylinder, cylinderGeo, cylinderLength, cylinderRadius, length;
      length = p1.position.distanceTo(p2.position);
      cylinderRadius = 2;
      cylinderLength = length;
      cylinderGeo = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderLength, 6, 1, false);
      cylinder = new THREE.Mesh(cylinderGeo, cylinderMaterial);
      cylinder.p1 = p1;
      cylinder.p2 = p2;
      constraintObjects.push(cylinder);
      alignCylinderToParticles(cylinder, p1, p2);
      return cylinder;
    };
    createChristmasRope = function(ropeId, startVector, endVector, letters) {
      var constraint, diff, i, lastParticle, letter, letterId, letterMargin, letterParticle, particle, particleLetter, particleSettings, posVector, segmentCount, textMesh, _i, _results;
      diff = (new THREE.Vector3()).sub(endVector, startVector);
      letterMargin = 3;
      letterId = 0;
      segmentCount = letterMargin + letterMargin * letters.length + letterMargin;
      particleLetter = letterMargin + Math.ceil(letterMargin / 2);
      particle = null;
      lastParticle = null;
      _results = [];
      for (i = _i = 1; 1 <= segmentCount ? _i <= segmentCount : _i >= segmentCount; i = 1 <= segmentCount ? ++_i : --_i) {
        posVector = (new THREE.Vector3()).add(startVector, diff.clone().multiplyScalar(i / segmentCount));
        particleSettings = {
          id: ropeId + 'particle' + i,
          position: posVector,
          mass: 3.0,
          immovable: i === 1 || i === segmentCount
        };
        particle = new Particle(particleSettings);
        rigidbody.addParticle(particle, createParticle);
        if (i === particleLetter && i + Math.floor(letterMargin / 2) + letterMargin <= segmentCount) {
          particleSettings = {
            id: ropeId + 'particleLetter' + i,
            position: (new THREE.Vector3()).add(posVector, new THREE.Vector3(0, -40, 0)),
            mass: 15.0,
            immovable: false
          };
          letterParticle = new Particle(particleSettings);
          rigidbody.addParticle(letterParticle, createParticle);
          constraint = new Constraint(null);
          constraint.p1 = particle;
          constraint.p2 = letterParticle;
          rigidbody.addConstraint(constraint, createCylinderConstraint);
          letter = letters[letterId];
          textMesh = createTextMesh(letter);
          textMesh.position = letterParticle.position;
          parent.add(textMesh);
          letterId++;
          particleLetter += letterMargin;
        }
        if (lastParticle != null) {
          constraint = new Constraint(null);
          constraint.p1 = lastParticle;
          constraint.p2 = particle;
          rigidbody.addConstraint(constraint, createCylinderConstraint);
        }
        _results.push(lastParticle = particle);
      }
      return _results;
    };
    createChristmasRope('first', new THREE.Vector3(-300, 230, 0), new THREE.Vector3(300, 230, 0), ['G', 'O', 'D']);
    createChristmasRope('second', new THREE.Vector3(-250, 100, 0), new THREE.Vector3(250, 100, 0), ['J', 'U', 'L']);
    return parent.add(rigidbody.getScene());
  };

  init();

  createScene();

  animate();

}).call(this);
