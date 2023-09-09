import React, { useRef, useEffect, useState } from 'react';
import useAnimationFrame from '../hooks/useAnimationFrame';
import './Orbits.css';

let orbs = [];

const Orbits = () => {
    const canvasElem = useRef(null);
    const [count, setCount] = useState(0);
    const [opt, setOpt] = useState(new Settings());
    let ctx = null;
    let ctx2 = null;
    let currentTime = 0;

    class Orb {
        constructor(radius, angle){
            this.angle = angle
            this.lastAngle = this.angle;
            this.radius = radius*opt.scale;
            this.speed = Math.random()/30000 * this.radius + 0.015;
            this.size = this.radius/200 + .5;
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
            
                if(opt.toggleLight){
                    ctx.lineWidth = 1;
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
    }, []);

    // animate the canvas
    useAnimationFrame((deltaTime) => {
        setCount(prevCount => (prevCount + deltaTime * 0.01) % 100);
        if(ctx)
            draw(deltaTime);
    });

    

    const setup = () => {
        const canvas = canvasElem.current;
        ctx = canvas.getContext('2d');
        ctx2 = getOffscreenCanvas();

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
        <div className='orbits-container'>
            <div>{Math.round(count)}, {orbs.length}</div>
            <canvas ref={canvasElem} width={opt.canvasSize.w} height={opt.canvasSize.h} />
        </div>

    );

    

}

class Settings{
    canvasSize = {w: 1500, h: 1000};
    orbSize = 1;
    scale = 3;
    speed = 50;
    radius = 1;
    center = {x: this.canvasSize.w/2, y: this.canvasSize.h/2};
    clearAlpha = 95;
    toggleLight = true;
    orbitalAlpha = 100;
    lightAlpha = 5;
    count = 100;
}




export default Orbits;

