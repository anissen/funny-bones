Detector.addGetWebGLMessage() unless Detector.webgl



GravitySettings = ->
  @enabled = true
  @x = 0.0
  @y = -9.82
  @z = 0.0

Settings = ->
  @gravity = new GravitySettings()
  @running = true
  @

settings = new Settings()
selectedParticle = null

world = null
scene = null
rigidbody = new RigidBody settings
constraintObjects = []



imgTexture2 = THREE.ImageUtils.loadTexture( "/data/images/pine.jpg" )
imgTexture2.wrapS = imgTexture2.wrapT = THREE.RepeatWrapping
imgTexture2.anisotropy = 16

sphereMaterial = new THREE.MeshPhongMaterial(
  ambient: 0xFFFFFF
  color: 0xAA0000
  specular: 0x555555
  shininess: 80
)

cylinderMaterial = new THREE.MeshPhongMaterial(
  map: imgTexture2
  bumpMap: imgTexture2
  bumpScale: 1
  ambient: 0xFFFFFF
  color: 0x00AA00
  specular: 0x555555
  shininess: 10
)


container = undefined
stats = undefined
hex = undefined
color = undefined
camera = undefined
cameraTarget = undefined
scene = undefined
renderer = undefined
effectFXAA = undefined
textMesh1 = undefined
textMesh2 = undefined
textGeo = undefined
material = undefined
parent = undefined
text = "GOD JUL"
height = 15
size = 50
hover = 30
curveSegments = 4
bevelThickness = 2
bevelSize = 1.5
bevelSegments = 3
bevelEnabled = true
font = "optimer"
weight = "bold"
style = "normal"
mirror = true
targetRotation = 0
targetRotationOnMouseDown = 0
mouseX = 0
mouseXOnMouseDown = 0
windowHalfX = window.innerWidth / 2
windowHalfY = window.innerHeight / 2
postprocessing = enabled: false
glow = 0.9


decimalToHex = (d) ->
  hex = Number(d).toString(16)
  hex = "000000".substr(0, 6 - hex.length) + hex
  hex.toUpperCase()

init = ->
  container = document.createElement("div")
  document.body.appendChild container

  # CAMERA
  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500)
  camera.position.set 0, 400, 700
  cameraTarget = new THREE.Vector3(0, 150, 0)

  # SCENE
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x112211, 250, 1400)

  # LIGHTS
  dirLight = new THREE.DirectionalLight(0xffffff, 0.125)
  dirLight.position.set(0, 0, 1).normalize()
  scene.add dirLight

  pointLight = new THREE.PointLight(0xffffff, 1.5)
  pointLight.position.set 0, 100, 90
  scene.add pointLight
  #pointLight.color.setHSV Math.random(), 0.95, 0.85

  hex = decimalToHex(pointLight.color.getHex())
  material = new THREE.MeshFaceMaterial([new THREE.MeshPhongMaterial( # front
    color: 0xFF0000
    shading: THREE.FlatShading
  ), new THREE.MeshPhongMaterial( # side
    color: 0xFFFFFF
    shading: THREE.SmoothShading
  )])
  parent = new THREE.Object3D()
  parent.position.y = 100
  scene.add parent
  #createText()
  plane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshBasicMaterial(
    color: 0x00BB00
    opacity: 0.5
    transparent: true
  ))
  plane.position.y = 0
  plane.rotation.x = -Math.PI / 2
  scene.add plane

  # RENDERER
  renderer = new THREE.WebGLRenderer(antialias: true)
  renderer.setSize window.innerWidth, window.innerHeight
  renderer.setClearColor scene.fog.color, 1
  container.appendChild renderer.domElement

  # STATS
  stats = new Stats()
  stats.domElement.style.position = "absolute"
  stats.domElement.style.top = "0px"

  #container.appendChild( stats.domElement );

  # EVENTS
  document.addEventListener "mousedown", onDocumentMouseDown, false
  document.addEventListener "touchstart", onDocumentTouchStart, false
  document.addEventListener "touchmove", onDocumentTouchMove, false
  window.addEventListener "resize", onWindowResize, false

onWindowResize = ->
  windowHalfX = window.innerWidth / 2
  windowHalfY = window.innerHeight / 2
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize window.innerWidth, window.innerHeight

createTextMesh = (text) ->
  textGeo = new THREE.TextGeometry(text,
    size: size
    height: height
    curveSegments: curveSegments
    font: font
    weight: weight
    style: style
    bevelThickness: bevelThickness
    bevelSize: bevelSize
    bevelEnabled: bevelEnabled
    material: 0
    extrudeMaterial: 1
  )
  textGeo.computeBoundingBox()
  textGeo.computeVertexNormals()
  centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x)
  textMesh1 = new THREE.Mesh(textGeo, material)
  textMesh1.position.x = centerOffset
  textMesh1.position.y = -50
  textMesh1.position.z = -height/2
  textMesh1.rotation.x = 0
  textMesh1.rotation.y = Math.PI * 2
  container = new THREE.Object3D()
  container.add textMesh1
  container

onDocumentMouseDown = (event) ->
  event.preventDefault()
  document.addEventListener "mousemove", onDocumentMouseMove, false
  document.addEventListener "mouseup", onDocumentMouseUp, false
  document.addEventListener "mouseout", onDocumentMouseOut, false
  mouseXOnMouseDown = event.clientX - windowHalfX
  targetRotationOnMouseDown = targetRotation

onDocumentMouseMove = (event) ->
  mouseX = event.clientX - windowHalfX
  targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02

onDocumentMouseUp = (event) ->
  document.removeEventListener "mousemove", onDocumentMouseMove, false
  document.removeEventListener "mouseup", onDocumentMouseUp, false
  document.removeEventListener "mouseout", onDocumentMouseOut, false

onDocumentMouseOut = (event) ->
  document.removeEventListener "mousemove", onDocumentMouseMove, false
  document.removeEventListener "mouseup", onDocumentMouseUp, false
  document.removeEventListener "mouseout", onDocumentMouseOut, false

onDocumentTouchStart = (event) ->
  if event.touches.length is 1
    event.preventDefault()
    mouseXOnMouseDown = event.touches[0].pageX - windowHalfX
    targetRotationOnMouseDown = targetRotation

onDocumentTouchMove = (event) ->
  if event.touches.length is 1
    event.preventDefault()
    mouseX = event.touches[0].pageX - windowHalfX
    targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.05

animate = ->
  requestAnimationFrame animate
  render()
  stats.update()

render = ->
  parent.rotation.y += (targetRotation - parent.rotation.y) * 0.05

  #numConstraints = rigidbody.constraints.length
  #rigidbody.constraints[Math.floor(Math.random()*numConstraints)].p1.position.y += 1
  rigidbody?.calculate()
  for c in constraintObjects
    alignCylinderToParticles(c, c.p1, c.p2)

  camera.lookAt cameraTarget
  renderer.clear()
  renderer.render scene, camera

alignCylinderToParticles = (cylinder, p1, p2) ->
  length = p1.position.distanceTo(p2.position)
  v = new THREE.Vector3()
  v = v.sub(p2.position, p1.position)
  center = v.clone().add(p1.position, v.clone().divideScalar(2))
  cylinder.position = center

  z = new THREE.Vector3(0,1,0)

  # Get cross product (the axis of rotation)
  t = z.clone().cross(z, v)

  # Get angle. length is magnitude of the vector
  angle = Math.acos(z.dot(v) / length)

  rotObjectMatrix = new THREE.Matrix4()
  rotObjectMatrix.makeRotationAxis(t.normalize(), angle)
  cylinder.matrix = new THREE.Matrix4()
  cylinder.matrix.multiplySelf(rotObjectMatrix)      # post-multiply
  cylinder.rotation.setEulerFromRotationMatrix(cylinder.matrix)

createScene = ->
  radius = 6
  segments = 8
  rings = 8

  createParticle = (p) ->
    sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, rings),
      sphereMaterial)
    sphereMesh.position = p.position
    sphereMesh

  createCylinderConstraint = (c, p1, p2) ->
    length = p1.position.distanceTo(p2.position)

    #THREE.CylinderGeometry = function ( radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded )
    cylinderRadius = 3
    cylinderLength = length
    cylinderGeo = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderLength, 6, 1, false)
    cylinder = new THREE.Mesh(cylinderGeo, cylinderMaterial)
    cylinder.p1 = p1
    cylinder.p2 = p2
    constraintObjects.push cylinder

    alignCylinderToParticles(cylinder, p1, p2)

    cylinder

  createChristmasRope = (ropeId, startVector, endVector, letters) ->
    diff = (new THREE.Vector3()).sub(endVector, startVector)
    letterMargin = 3
    letterId = 0
    segmentCount = letterMargin + letterMargin * letters.length + letterMargin
    particleLetter = letterMargin + Math.ceil(letterMargin / 2)
    particle = null
    lastParticle = null
    for i in [1..segmentCount]
      posVector = (new THREE.Vector3()).add(startVector, diff.clone().multiplyScalar(i / segmentCount))
      particleSettings =
        id: ropeId + 'particle' + i
        position: posVector
        mass: 3.0
        immovable: (i is 1 or i is segmentCount)
      particle = new Particle particleSettings
      rigidbody.addParticle particle, createParticle

      if i is particleLetter and i + Math.floor(letterMargin / 2) + letterMargin <= segmentCount
        particleSettings =
          id: ropeId + 'particleLetter' + i
          position: (new THREE.Vector3()).add(posVector, new THREE.Vector3(0, -40, 0))
          mass: 15.0
          immovable: false
        letterParticle = new Particle particleSettings
        rigidbody.addParticle letterParticle, createParticle

        constraint = new Constraint(null)
        constraint.p1 = particle
        constraint.p2 = letterParticle
        rigidbody.addConstraint constraint, createCylinderConstraint

        letter = letters[letterId]
        textMesh = createTextMesh(letter)
        textMesh.position = letterParticle.position
        parent.add textMesh

        letterId++
        particleLetter += letterMargin


      if lastParticle?
        constraint = new Constraint(null)
        constraint.p1 = lastParticle
        constraint.p2 = particle
        rigidbody.addConstraint constraint, createCylinderConstraint
      lastParticle = particle

  createChristmasRope 'first', (new THREE.Vector3(-300, 230, 0)), (new THREE.Vector3(300, 230, 0)), ['G', 'O', 'D']
  createChristmasRope 'second', (new THREE.Vector3(-250, 100, 0)), (new THREE.Vector3(250, 100, 0)), ['J', 'U', 'L']

  parent.add rigidbody.getScene()

init()
createScene()
animate()