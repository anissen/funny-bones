v = (x, y, z) ->
  new THREE.Vector3(x, y, z)
#v3 = (pos) ->
#  new THREE.Vertex(new THREE.Vector3(pos.x, pos.y, pos.z))
# Combined options object

#var object = tQuery.createTorus().addTo(scene);

world = null
scene = null
rigidbody = new RigidBody()
constraintObjects = []


#  DRAW LINES
readJson = (data) ->
  if scene? then world.remove scene

  scene = new THREE.Scene()
  world.add scene

  radius = 1.0 #0.015
  segments = 8
  rings = 8
  sphereMaterial = new THREE.MeshLambertMaterial(
    ambient: 0xFFFFFF
    color: 0x0000FF
  )
  lineMat = new THREE.LineBasicMaterial(
    ambient: 0xFFFFFF
    color: 0xFF0000
    lineWidth: 1
  )
  ###
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
  ###
  #sphereGeo = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial)
  #sphereGeo = new THREE.SphereGeometry(radius, segments, rings)

  createParticle = (p) ->
    sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, rings),
      sphereMaterial)
    #p.settings.position.x /= 100
    #p.settings.position.y /= 100
    #p.settings.position.z /= 100
    sphereMesh.position = p.position
    sphereMesh

  createConstraint = (c, p1, p2) ->
    lineGeo = new THREE.Geometry()
    lineGeo.vertices.push p1.position, p2.position
    lineGeo.dynamic = true
    constraintObjects.push lineGeo
    new THREE.Line(lineGeo, lineMat)

  rigidbody.load data, createParticle, createConstraint
  scene.add rigidbody.getScene()

$ ->
  options =
    cameraControls: true
    stats: false

  world = threeBox($("#three-placeholder").get(0), options)

  lineLength = 200
  lineGeo = new THREE.Geometry()
  lineGeo.vertices.push new THREE.Vector3(-lineLength, 0, 0),
                        new THREE.Vector3(lineLength, 0, 0),
                        new THREE.Vector3(0, -lineLength, 0),
                        new THREE.Vector3(0, lineLength, 0),
                        new THREE.Vector3(0, 0, -lineLength),
                        new THREE.Vector3(0, 0, lineLength)
  lineMat = new THREE.LineBasicMaterial(
    color: 0x000000
    lineWidth: 1
  )
  line = new THREE.Line(lineGeo, lineMat)
  line.type = THREE.Lines
  world.add line
  tQuery.createAmbientLight().addTo(world).color 0x444444
  tQuery.createDirectionalLight().addTo(world).position(-1, 1, 1).color(0xFF88BB).intensity 3
  tQuery.createDirectionalLight().addTo(world).position(1, 1, -1).color(0x4444FF).intensity 2

  world.loop().hook((delta, now) ->
    rigidbody?.calculate()
    for c in constraintObjects
      c.verticesNeedUpdate = true
  )

  world.start()

  $.ajax(
    url: 'data/hitman.json',
    dataType: 'JSON',
    type: 'GET'
  )
  .done((data) -> readJson(data))
  .fail((err) -> alert('Error!!1! ' + err))

handleDnD = (files) ->
  f = files[0]
  alert "Not a JSON file!"  unless f.type.match("application/json")
  reader = new FileReader()
  reader.onloadend = (e) ->
    result = JSON.parse(@result)
    readJson result

  reader.readAsText f

dnd = new DnDFileController "body", handleDnD
