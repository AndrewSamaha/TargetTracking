import * as dat from 'dat.gui';
import ShrapnelManager from './shrapnel';
import Target from './target';
import DataCollector from './DataCollector';
import { SingleMovingTarget } from './GameTypes/SingleMovingTarget';

var TargetSettings = {
    initialRadius: 100,
    maxRadius: 200,
    speed: .1,
    growthRate: .0001
};

const gui = new dat.GUI({name: 'Settings'});
var GameSelector = gui.addFolder('Game Selector');

GameSelector.add({ 
    Restart: function(){ 
        target.remove();
        init(TargetSettings); 

    }},
    'Restart');


var TargetSettingsGUI = gui.addFolder('Target Settings');

TargetSettingsGUI.add(TargetSettings, 'initialRadius', 10, 200).onFinishChange(function() {
    console.log(`getValue = ${this.getValue()}`);
});
TargetSettingsGUI.add(TargetSettings, 'maxRadius', 10, 200);
TargetSettingsGUI.add(TargetSettings, 'speed', 0, .2);
TargetSettingsGUI.add(TargetSettings, 'growthRate', 0, .001);

let game = null;

function init(targetParams) {
    // this will become smt.startGame()
    const dataCollector = new DataCollector();
    const shrapnelManager = new ShrapnelManager();
    shrapnelManager.dataCollector = dataCollector;

    game = new SingleMovingTarget({
        dataCollector,
        shrapnelManager,
        })
    
    // game.startGame(targetParams);
    game.newTarget(null, targetParams);
    
    tic();
}

function tic() {
    requestAnimationFrame(tic);
    game.tic();
}

window.onload=init;