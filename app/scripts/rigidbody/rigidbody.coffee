
class Particle
  constructor: (@settings, @mesh) ->
    if @mesh?
      @mesh = @mesh.clone
      @mesh.position = @settings.position
    @immovable = @settings.immovable
    @position = new THREE.Vector3(@settings.position.x, @settings.position.y, @settings.position.z)
    @oldPosition = @position.clone()
    @accumulatedForce = new THREE.Vector3(0.0, 0.0, 0.0)
  getMass: ->
    if @immovable then 0.0 else @settings.mass
  getInverseMass: ->
    if @immovable then 0.0 else 1/@getMass()

class Constraint
  constructor: (@settings, @mesh) ->
    if @mesh?
      @mesh.position = @settings.position

class RigidBody
  constructor: ->
    @bodyScene = new THREE.Scene()
    @particles = {}
    @constraints = []
    @step = 1.0
    @damping = 0.05
    @iterations = 3
  addParticle: (particle, particleCallback) ->
    @particles[particle.settings.id] = particle
    @bodyScene.add particleCallback(particle)
  getParticle: (id) ->
    @particles[id]
  addConstraint: (constraint, constraintCallback) ->
    @constraints.push constraint
    constraint.p1 = @getParticle(constraint.settings.particle1)
    constraint.p2 = @getParticle(constraint.settings.particle2)
    constraint.length = constraint.p1.position.distanceTo(constraint.p2.position)
    @bodyScene.add constraintCallback(constraint, constraint.p1, constraint.p2)
  load: (data, particleCallback, constraintCallback) ->
    for p in data.rigidbody.particle
      @addParticle new Particle(p), particleCallback
    for c in data.rigidbody.constraint
      @addConstraint new Constraint(c), constraintCallback
  getScene: ->
    @bodyScene
  calculate: ->
    @accumulateForces()
    @verlet()
    for i in [0...@iterations]
      @satisfyConstraints()
    @constraintHack()
  accumulateForces: ->
    for k, p of @particles
      p.accumulatedForce.addSelf(new THREE.Vector3(0.0, -0.00000982, 0.0))
  verlet: ->
    # Calc deltaTime powered by 2.
    step2 = @step * @step

    # Iterate through all particles and do Verlet integration.
    for k, p of @particles
      result = new THREE.Vector3(0,0,0)

      temp = p.position.clone()
      a = p.accumulatedForce.clone()

      # Verlet integration step accelerates accumulated forces and adds this to delta movement of the particle.
      # particle = particle + deltaPosition + (accuForce * (deltaTime^2)
      result.sub(p.position, p.oldPosition)
      a.multiplyScalar(p.getMass() * step2)
      result.addSelf(a)

      # Add the resulting force to the particle. Decreasing it by a few percent creates a natural drag which makes objects decelerate.
      p.position.addSelf(result.multiplyScalar(1.0 - @damping))

      # Update old position
      p.oldPosition = temp
  satisfyConstraints: ->
    # DEFAULT CONSTRAINT

    for c in @constraints
      # Dont try to satisfy if both particles are immovable
      continue if c.p1.immovable and c.p2.immovable

      x1 = c.p1.position
      x2 = c.p2.position

      invmass1 = c.p1.getInverseMass()
      invmass2 = c.p2.getInverseMass()

      delta = new THREE.Vector3(0,0,0)
      delta.sub(x2, x1)
      deltalength = delta.length()
      diff = (deltalength - c.length) / (deltalength * (invmass1 + invmass2))

      displacement = delta.multiplyScalar(diff)
      displacement1 = displacement.clone().multiplyScalar(invmass1)
      displacement2 = displacement.clone().multiplyScalar(invmass2)
      x1.addSelf(displacement1)
      x2.subSelf(displacement2)
  constraintHack: ->
    for k, p of @particles
      if p.position.y < 0
        p.position.setY 10


window.Particle = Particle
window.Constraint = Constraint
window.RigidBody = RigidBody
