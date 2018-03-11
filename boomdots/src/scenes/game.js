import phaser, { Scene } from 'phaser'
export class Game extends Scene {
    constructor () {
        super({
            key: 'game',
            physics: {
                default: 'arcade',
                arcade: {
                    debug: true
                }
            }
        })
        this.staticBg = null
        this.scrollingBg = null
        this.rocket = null
        this.scrollSpeed = 0
        this.alien = null
        this.alienTargetY = 0
        this.canUpdateAlien = false
        this.particles = null
        this.emitter = null
        this.isRocketResetting = false
        this.topSpikes = null
        this.bottomSpikes = null
        this.cameraRect = null
        this.isGameOver = false
    }
    create () {
        this.staticBg = this.add.image(0, 0, 'bg-static')
        this.staticBg.setTint(0x444444)
        this.staticBg.setOrigin(0.5)
        this.scrollingBg = this.add.tileSprite(0,0,396,529,'bg-overlay')
        this.scrollingBg.setOrigin(0.5)
        this.topSpikes = this.add.sprite(0, 0, 'spike')
        this.topSpikes.setOrigin(0.5, 0)
        this.bottomSpikes = this.add.sprite(0, 0, 'spike')
        this.bottomSpikes.setOrigin(0, 1)
        this.bottomSpikes.flipY = true
        this.cameraRect = this.add.zone(0, 0, 0, 0)
        this.sys.game.events.on('resize', this.resize, this)
        this.resize()
        this.events.once('shutdown', this.shutdown, this)
        
        this.rocket = this.add.sprite(0, 160, 'rocket')
        this.alien = this.add.sprite(0, -300, 'alien')
        this.physics.world.enable([this.rocket, this.alien, this.topSpikes])
        this.topSpikes.body.immovable = true
        this.resetAlien()
        this.particles = this.add.particles('particle')
        this.emitter = this.particles.createEmitter({
            angle: { min: 0, max: 360 },
            speed: { min: 50, max: 200 },
            quantity: { min: 40, max: 50 },
            lifespan: { min: 200, max: 500},
            alpha: { start: 1, end: 0 },
            scale: { min: 0.5, max: 0.5 },
            rotate: { start: 0, end: 360 },
            gravityY: 800,
            on: false
        })
        this.input.on('pointerdown', this.launchRocket, this)
    }
    resize () {
        let cam = this.cameras.main
        cam.setViewport(0,0,window.innerWidth, window.innerHeight)
        cam.centerToBounds()
        cam.zoom = Math.max(window.innerWidth/270, window.innerHeight/480)
        // cam.zoom = Math.min(window.innerWidth/270, window.innerHeight/480)
        this.cameraRect.x = cam.x
        this.cameraRect.y = cam.y
        this.cameraRect.width = cam.width/cam.zoom
        this.cameraRect.height = cam.height/cam.zoom
        phaser.Display.Align.In.TopCenter(this.topSpikes, this.cameraRect)
        phaser.Display.Align.In.BottomCenter(this.bottomSpikes, this.cameraRect)
    }
    update (time, delta) {
        if (this.canUpdateAlien) {
            this.moveAlien(time, delta)
            this.physics.add.overlap(this.rocket, this.alien, this.rocketCollidedWithAlien, null, this)
        }
        if (!this.isGameOver) {
            this.physics.add.overlap(this.rocket, this.topSpikes, this.rocketCollidedWithSpike, null, this)
        }
        if (this.isRocketResetting) {
            this.scrollingBg.tilePositionY -= delta
            this.rocket.y += delta
            if (this.rocket.y >= 160) {
                this.rocket.y = 160
                this.isRocketResetting = false
                this.resetAlien()
            }
        }
    }
    resetAlien () {
        this.canUpdateAlien = true
        this.alien.x = 0
        this.alien.y = -300
        this.alienTargetY = phaser.Math.Between(-100, 0)
    }
    moveAlien (time, delta) {
        this.alien.y += (this.alienTargetY - this.alien.y) * 0.3
        this.alien.x = Math.sin(time * 0.005) * 80
    }
    launchRocket () {
        this.rocket.body.setVelocity(0, -2000)
    }
    rocketCollidedWithAlien (rocket, alien) {
        if (!this.canUpdateAlien) { //Overlap runs multiple frames, we only want it to run once
            return
        }
        this.canUpdateAlien = false
        this.rocket.body.setVelocity(0)
        this.particles.emitParticleAt(this.alien.x, this.alien.y)
        this.alien.y = -300
        this.cameras.main.shake(100, 0.01, 0.01)
        this.time.delayedCall(200, this.resetRocket, [], this)
    }
    rocketCollidedWithSpike (rocket, spike) {
        if (this.isGameOver) {
            return
        }
        this.canUpdateAlien = false
        this.isGameOver = true
        this.rocket.body.setVelocity(0)
        this.particles.emitParticleAt(this.rocket.x, this.rocket.y-this.rocket.height)
        this.cameras.main.shake(100, 0.01, 0.01)
        this.alien.destroy()
        this.rocket.destroy()
    }
    resetRocket () {
        this.isRocketResetting = true
    }
    shutdown () {
        this.input.off('pointerdown', this.launchRocket, this)
        this.sys.game.events.off('resize', this.resize, this)
    }
}