v = (x, y, z) ->
  new THREE.Vector3(x, y, z)

Settings = ->
  #@message = "dat.gui"
  @gravity = -9.82
  #@displayOutline = false
  @explode = -> alert 'Bang!'
  @

settings = new Settings()

world = null
scene = null
rigidbody = new RigidBody settings
constraintObjects = []


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

  groundSize = 150
  groundGeo = new THREE.PlaneGeometry(groundSize, groundSize)
  groundMesh = new THREE.Mesh(groundGeo, new THREE.MeshBasicMaterial({}))
  groundMesh.rotation.x -= Math.PI / 2
  groundMesh.position.y -= 0.3 # avoid flickering with axis lines
  world.add groundMesh



  cubeGeometry = new THREE.CubeGeometry(groundSize, groundSize, groundSize)
  cubeMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff, wireframe: true})
  cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.position.y += groundSize / 2
  world.add cube

  lineLengthHalf = groundSize / 2
  lineGeo = new THREE.Geometry()
  lineGeo.vertices.push new THREE.Vector3(-lineLengthHalf, 0, 0),
                        new THREE.Vector3(lineLengthHalf, 0, 0),
                        new THREE.Vector3(0, -lineLengthHalf, 0),
                        new THREE.Vector3(0, lineLengthHalf, 0),
                        new THREE.Vector3(0, 0, -lineLengthHalf),
                        new THREE.Vector3(0, 0, lineLengthHalf)
  lineMat = new THREE.LineBasicMaterial(
    color: 0x000000
    lineWidth: 2
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


  gui = new dat.GUI()
  #gui.add settings, 'message'
  gui.add settings, 'gravity', -20.0, 20.0
  #gui.add settings, 'displayOutline'
  gui.add settings, 'explode'


handleDnD = (files) ->
  f = files[0]
  alert "Not a JSON file!"  unless f.type.match("application/json")
  reader = new FileReader()
  reader.onloadend = (e) ->
    result = JSON.parse(@result)
    readJson result

  reader.readAsText f

dnd = new DnDFileController "body", handleDnD
