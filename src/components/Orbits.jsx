import React, { useRef, useEffect, useState } from 'react';
import useAnimationFrame from '../hooks/useAnimationFrame';
import './Orbits.css';

let orbs = [];

const Orbits = (props) => {
    const canvasElem = useRef(null);
    const [count, setCount] = useState(0);
    const [opt, setOpt] = useState(new Settings(props.w,props.h));
    let ctx = null;
    let ctx2 = null;
    let currentTime = 0;

    class Orb {
        constructor(radius, angle){
            this.angle = angle
            this.lastAngle = this.angle;
            this.radius = radius*opt.scale;
            this.speed = Math.random()/50000 * this.radius + 0.01;
            this.size = this.radius/200 + .5;
            this.hasLight = Math.random() > .75;
            this.update();
        }

        update(){
            this.lastAngle = this.angle;
            this.angle += this.speed * opt.speed/50;
            this.x = Math.cos(this.angle) * this.radius;
            this.y = Math.sin(this.angle) * this.radius;
        }

        render(){
            if(ctx){
                ctx.strokeStyle = 'hsla('+Math.round(this.angle*180/Math.PI)+', 100%, 50%, '+opt.orbitalAlpha/100+')';
                ctx.lineWidth = this.size;
                ctx.beginPath();
                ctx.arc(opt.center.x,opt.center.y,this.radius,this.lastAngle,this.angle+0.001, false);
                ctx.stroke();
                ctx.fill();
                ctx.closePath();
            
                if(opt.toggleLight && this.hasLight){
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'hsla('+Math.round(this.angle*180/Math.PI)+', 100%, 70%, '+opt.lightAlpha/100+')';
                    ctx.beginPath();
                    ctx.moveTo(opt.center.x ,opt.center.y);
                    ctx.lineTo(opt.center.x + this.x, opt.center.y + this.y);
                    ctx.stroke();
                }
            }
        }
    }

    useEffect(() => {
        // setup the canvas
        setup();
    }, [orbs]);

    // animate the canvas
    useAnimationFrame((deltaTime) => {
        // limit the framerate to 60 fps
        if (Date.now() - currentTime > 1/120*1000) {
            currentTime = Date.now();
            // draw the next frame
            if(ctx)
                draw(deltaTime);
        }
    });

    
    const setup = () => {
        const canvas = canvasElem.current;
        ctx = canvas.getContext('2d');
        ctx2 = getOffscreenCanvas();
        console.log(opt)

        // set the initial state
        orbs = [];
        for (let i = 0; i < opt.count; i++) {
            orbs.push(new Orb(Math.round(Math.random()*300), Math.round(Math.random()*360)));
        }
    }

    const draw = (time) => {
        currentTime += 1;

        // swap canvas (optional)
        ctx2.clearRect(0, 0, opt.canvasSize.w, opt.canvasSize.h);
        ctx2.globalAlpha = opt.clearAlpha/100;
        ctx2.drawImage(ctx.canvas, 0, 0, opt.canvasSize.w, opt.canvasSize.h)
        ctx.clearRect(0, 0, opt.canvasSize.w, opt.canvasSize.h);
        ctx.drawImage(ctx2.canvas, 0, 0, opt.canvasSize.w, opt.canvasSize.h)

        // draw stuff
        for (let i = 0; i < orbs.length; i++) {
            const orb = orbs[i];
            orb.update();
            orb.render();
        }
    }

    const getOffscreenCanvas = () => {
        const canvas = document.createElement('canvas');
        canvas.width = opt.canvasSize.w;
        canvas.height = opt.canvasSize.h;
        return canvas.getContext('2d');
    }

    return (
        <div className='orbits-container background'>
            <canvas ref={canvasElem} className='orbits-canvas' width={opt.canvasSize.w} height={opt.canvasSize.h} />
        </div>

    );

    

}

class Settings{
    canvasSize = {};
    orbSize = .5;
    scale = 3;
    speed = 30;
    radius = 1;
    center = {x: this.canvasSize.w/2, y: this.canvasSize.h/2};
    clearAlpha = 95;
    toggleLight = true;
    orbitalAlpha = 100;
    lightAlpha = 3;
    count = 400;

    constructor(width,height){
        this.canvasSize.w = width;
        this.canvasSize.h = height;
        this.center.x = this.canvasSize.w/2;
        this.center.y = this.canvasSize.h/2;
    }
}




export default Orbits;

