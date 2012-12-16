(function() {
  var Constraint, Particle, RigidBody;

  Particle = (function() {

    function Particle(settings, mesh) {
      this.settings = settings;
      this.mesh = mesh;
      if (this.mesh != null) {
        this.mesh = this.mesh.clone;
        this.mesh.position = this.settings.position;
      }
      this.immovable = this.settings.immovable;
      this.position = new THREE.Vector3(this.settings.position.x, this.settings.position.y, this.settings.position.z);
      this.oldPosition = this.position.clone();
      this.accumulatedForce = new THREE.Vector3(0.0, 0.0, 0.0);
    }

    Particle.prototype.getMass = function() {
      if (this.immovable) {
        return 0.0;
      } else {
        return this.settings.mass;
      }
    };

    Particle.prototype.getInverseMass = function() {
      if (this.immovable) {
        return 0.0;
      } else {
        return 1 / this.getMass();
      }
    };

    return Particle;

  })();

  Constraint = (function() {

    function Constraint(settings, mesh) {
      this.settings = settings;
      this.mesh = mesh;
      if (this.mesh != null) {
        this.mesh.position = this.settings.position;
      }
    }

    return Constraint;

  })();

  RigidBody = (function() {

    function RigidBody(settings) {
      this.settings = settings;
      this.bodyScene = new THREE.Scene();
      this.particles = {};
      this.constraints = [];
      this.step = 1.0;
      this.damping = 0.05;
      this.iterations = 3;
    }

    RigidBody.prototype.addParticle = function(particle, particleCallback) {
      this.particles[particle.settings.id] = particle;
      return this.bodyScene.add(particleCallback(particle));
    };

    RigidBody.prototype.getParticle = function(id) {
      return this.particles[id];
    };

    RigidBody.prototype.addConstraint = function(constraint, constraintCallback) {
      this.constraints.push(constraint);
      constraint.p1 = this.getParticle(constraint.settings.particle1);
      constraint.p2 = this.getParticle(constraint.settings.particle2);
      constraint.length = constraint.p1.position.distanceTo(constraint.p2.position);
      return this.bodyScene.add(constraintCallback(constraint, constraint.p1, constraint.p2));
    };

    RigidBody.prototype.load = function(data, particleCallback, constraintCallback) {
      var c, p, _i, _j, _len, _len1, _ref, _ref1, _results;
      _ref = data.rigidbody.particle;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        this.addParticle(new Particle(p), particleCallback);
      }
      _ref1 = data.rigidbody.constraint;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        c = _ref1[_j];
        _results.push(this.addConstraint(new Constraint(c), constraintCallback));
      }
      return _results;
    };

    RigidBody.prototype.getScene = function() {
      return this.bodyScene;
    };

    RigidBody.prototype.calculate = function() {
      var i, _i, _ref;
      this.accumulateForces();
      this.verlet();
      for (i = _i = 0, _ref = this.iterations; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        this.satisfyConstraints();
      }
      return this.constraintHack();
    };

    RigidBody.prototype.accumulateForces = function() {
      var k, p, _ref, _results;
      _ref = this.particles;
      _results = [];
      for (k in _ref) {
        p = _ref[k];
        _results.push(p.accumulatedForce = new THREE.Vector3(0.0, this.settings.gravity / 1000, 0.0));
      }
      return _results;
    };

    RigidBody.prototype.verlet = function() {
      var a, k, p, result, step2, temp, _ref, _results;
      step2 = this.step * this.step;
      _ref = this.particles;
      _results = [];
      for (k in _ref) {
        p = _ref[k];
        result = new THREE.Vector3(0, 0, 0);
        temp = p.position.clone();
        a = p.accumulatedForce.clone();
        result.sub(p.position, p.oldPosition);
        a.multiplyScalar(p.getMass() * step2);
        result.addSelf(a);
        p.position.addSelf(result.multiplyScalar(1.0 - this.damping));
        _results.push(p.oldPosition = temp);
      }
      return _results;
    };

    RigidBody.prototype.satisfyConstraints = function() {
      var c, delta, deltalength, diff, displacement, displacement1, displacement2, invmass1, invmass2, x1, x2, _i, _len, _ref, _results;
      _ref = this.constraints;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (c.p1.immovable && c.p2.immovable) {
          continue;
        }
        x1 = c.p1.position;
        x2 = c.p2.position;
        invmass1 = c.p1.getInverseMass();
        invmass2 = c.p2.getInverseMass();
        delta = new THREE.Vector3(0, 0, 0);
        delta.sub(x2, x1);
        deltalength = delta.length();
        diff = (deltalength - c.length) / (deltalength * (invmass1 + invmass2));
        displacement = delta.multiplyScalar(diff);
        displacement1 = displacement.clone().multiplyScalar(invmass1);
        displacement2 = displacement.clone().multiplyScalar(invmass2);
        x1.addSelf(displacement1);
        _results.push(x2.subSelf(displacement2));
      }
      return _results;
    };

    RigidBody.prototype.constraintHack = function() {
      var k, p, _ref, _results;
      _ref = this.particles;
      _results = [];
      for (k in _ref) {
        p = _ref[k];
        if (p.position.y < 0) {
          _results.push(p.position.setY(0));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return RigidBody;

  })();

  window.Particle = Particle;

  window.Constraint = Constraint;

  window.RigidBody = RigidBody;

}).call(this);
