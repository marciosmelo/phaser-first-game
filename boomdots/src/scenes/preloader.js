import phaser from 'phaser'
export class Preloader extends phaser.Scene {
    constructor() {
        super({
            key: 'preloader'
        })
    }
    preload() {
        console.log('Preloader preload')
    }
}