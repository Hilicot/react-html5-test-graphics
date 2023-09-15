import React, { useRef, useState, useEffect } from 'react'
import useAnimationFrame from '../hooks/useAnimationFrame';

const spacing = 50;
let grid = null;

const NetworkBackground = (props) => {
    const canvasElem = useRef(null)

    const localMousePos = useRef({ x: 0, y: 0 })
    let currentTime = 0;

    useEffect(() => {
        // setup the canvas
        const canvas = canvasElem.current
        const ctx = canvas.getContext('2d')

        // setup the grid
        grid = new Grid(ctx, props.size[0], props.size[1]);

        // setup the mouse listener
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            localMousePos.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            }
        })
    }, [canvasElem])


    // animate the canvas
    useAnimationFrame((deltaTime) => {
        // limit the framerate to 60 fps
        if (Date.now() - currentTime > 1 / 120 * 1000) {
            currentTime = Date.now();
            // draw the next frame
            if (grid)
                grid.draw(deltaTime, localMousePos);
        }
    });

    return (
        <div className="background">
            <canvas ref={canvasElem} width={props.size[0]} height={props.size[1]} />
        </div>
    )
}

export default NetworkBackground

class Grid {
    width;
    height;
    ctx;
    constructor(ctx, width, height) {
        this.width = width;
        this.height = height;
        this.ctx = ctx;

        this.points = this.createPoints();
        this.createEdges();
    }

    createPoints() {
        let k = 0;
        const points = [];
        for (let i = 0; i < this.width; i = i + spacing) {
            for (let j = 0; j < this.height; j = j + spacing) {
                const x = i + Math.floor(Math.random() * spacing);
                const y = j + Math.floor(Math.random() * spacing);
                points.push(new Point(k++, x, y, i, j));
            }
        }
        return points;
    }

    createEdges() {
        for (let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i];
            const closest = [];

            // find the 5 closest points
            for (let j = 0; j < this.points.length; j++) {
                if (i === j) continue;
                const p2 = this.points[j];
                const dist = getDistance(p1, p2);
                if (closest.length < 5) {
                    closest.push({ dist, p2 });
                } else {
                    closest.sort((a, b) => a.dist - b.dist);
                    if (dist < closest[closest.length - 1].dist) {
                        closest[closest.length - 1] = { dist, p2 };
                    }
                }
            }
            p1.addNeighbors(closest.map(c => c.p2));
        }

    }

    draw(deltaTime, localMousePos, hovering) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = .75;
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();

        // move points based on cursor position
        for (let i = 0; i < this.points.length; i++)
            this.points[i].move(localMousePos.current);

        // draw points
        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i];

            const strength = (100 / getDistance(p, localMousePos.current)) ** 2;
            const alpha = strength > 0.2 ? Math.min(1, strength) : 0;
            this.ctx.beginPath();
            this.ctx.fillStyle = 'hsla(200,100%,70%,' + alpha + ')';
            this.ctx.moveTo(p.x, p.y);
            this.ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        // draw edges
        for (let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i];
            for (let j = 0; j < p1.neighbors.length; j++) {
                const p2 = p1.neighbors[j];
                const avgPoint = {
                    x: (p1.x + p2.x) / 2,
                    y: (p1.y + p2.y) / 2
                }
                const strength = (100 / getDistance(avgPoint, localMousePos.current)) ** 2;
                const alpha = strength > 0.2 ? Math.min(1, strength) : 0;
                this.ctx.beginPath();
                this.ctx.strokeStyle = 'hsla(200,100%,70%,' + alpha + ')';
                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.stroke();
            }
        }

    }

}

class Point {
    id;
    x;
    y;
    i;
    j;
    neighbors = [];
    speed = 0;
    target = { x: 0, y: 0 }
    originalDistance = 0;
    origin = { x: 0, y: 0 }
    t = 0;
    constructor(id, x, y, i, j) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.i = i;
        this.j = j;
        this.target = this.getNewTarget();
    }

    addNeighbors(neighbors) {
        // remove neighbors with lower id
        this.neighbors = neighbors.filter(n => n.id > this.id);
    }

    move(mousePos) {
        const dist = getDistance(this, mousePos);
        if (dist > 400) return;
        this.speed = this.getSpeed(dist);

        if (this.speed > 0 && this.t < 1 && !this.paused) { // is already moving
            // continue movement towards target with ease in and ease out
            this.t = Math.min(this.t + this.speed / this.originalDistance, 1); // time moment of movement(in [0,1])
            this.x = easeInOutQuart(this.t) * (this.target.x - this.origin.x) + this.origin.x;
            this.y = easeInOutQuart(this.t) * (this.target.y - this.origin.y) + this.origin.y;

        } else if (this.t >= 1) { // reached target, put in pause
            this.target = this.getNewTarget();
        } else if (this.t < 0) { // paused
            this.t = Math.min(this.t + this.speed, 0); // time moment of movement(in [0,1])
        } else {
            // start new movement

            this.paused = false;
        }
    }

    getSpeed(dist) {
        if (dist > 400) return 0;

        return Math.min((400 - dist) / 100, 0.5);
    }

    getNewTarget() {
        this.origin = { x: this.x, y: this.y };
        const offset = spacing;
        const target = {
            x: this.i + (Math.random()) * offset,
            y: this.j + (Math.random()) * offset
        }
        this.originalDistance = getDistance(this, target);
        this.t = -Math.random() * 100;
        this.paused = true;
        return target;
    }
}

function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

function easeInOutQuart(x) {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

function easeInOutQuad(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}