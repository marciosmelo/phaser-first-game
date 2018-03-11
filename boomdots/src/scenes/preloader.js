import { Scene } from 'phaser'

export class Preloader extends Scene{
    constructor(){
        super({
            key: 'preloader'
        })
    }

    preload () {
        this.load.image('bg-static', 'assets/square.png')
        this.load.image('bg-overlay', 'assets/bg.png')
        this.load.image('rocket', 'assets/rocket.png')
        this.load.image('alien', 'assets/alien.png')
        this.load.image('particle', 'assets/squareparticle.png')
        this.load.image('spike', 'assets/spikes.png')
    }

    create () {
        this.scene.start('game')
    }

}
