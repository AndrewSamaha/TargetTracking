import jQuery from "jquery";
Object.assign(window, { $: jQuery, jQuery })

import { calculateDistance } from "../helpers/math";
import Target from "../target";

class SingleMovingTarget {
    constructor(params) {
        this.params = {
            dataCollector: null,
            shrapnelManager: null,
            target: null,
            debug: 1
        };
        this.params = {...this.params, ...params};
        this.state = {
            mX: 0,
            mY: 0,
            distanceToTarget: 0,
            lastTicTime: 0,
            delta_t: 0,
            lastError: 0,
            audioReady: 0,
            targetNum: 0
        }
    }

    report = () => {
        console.log(this.params);
    }

    newTarget = (t, paramsPassed) => {
        this.state.targetNum++;
        if (paramsPassed) {;
            this.params = {...this.params, ...paramsPassed};
            this.params.target = {};
        } else {
            paramsPassed = {};
        }

        const { params, state } = this;
        params.target = new Target(params );


        const { target } = params;
        target.shrapnelManager = this.params.shrapnelManager;
    
        if (!t) t=0;
        target.startIn(t);
        
        if (state.audioReady == 0) {
            target.explosion_sound.load();
            state.audioReady = 1;
        }
        
        return target;
    }

    startGame = (paramsPassed) => {
        const { state, params } = this;
        state.targetNum = 0;
        params.dataCollector = new DataCollector();
        params.shrapnelManager = new ShrapnelManager();
        params.shrapnelManager.dataCollector = dataCollector;
        console.log('SingleMovingTarget.startGame, targetParams=',targetParams);
        const newParams = {...this.params, ...paramsPassed};
        newTarget(null, newParams);
        
        $(document).mousemove(this.onMouseMove).bind(this);
        tic();
    }

    tic = () => {
        const { 
            target, 
            shrapnelManager } = this.params;
        
        const { 
            state, 
            newTarget } = this;

        target.tic();
        shrapnelManager.tic();
    
        state.delta_t = Date.now() - state.lastTicTime;
    
        if (!target.alive) newTarget(1500);
        state.lastTicTime = Date.now();
    }

    // Callbacks

    onMouseMove = (e) => {
        const { params } = this;
        params.mX = e.pageX;
        params.mY = e.pageY;
        params.distanceToTarget = calculateDistance(target, mX, mY);
    }
    
}

export { SingleMovingTarget };