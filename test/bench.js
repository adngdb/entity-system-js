
// settings
var numCs = 200
var numEs = 500
var numCsPerE = 50


requirejs.config({
    baseUrl: '..',
});

require(['entity-manager'], function (EntityManager) {
    var manager = new EntityManager();
    
    // randomly create/remove a few components to seed data structures
    var cs = [], es = []
    for (var i=0; i<100; ++i) {
        var obj = {state: {}}
        obj.name = String(Math.random())
        obj.state[String(Math.random())] = 1
        cs.push(obj.name)
        manager.addComponent( obj.name, obj)
        var ent = manager.createEntity([obj.name])
        es.push(ent)
    }
    for (var i=0; i<100; ++i) {
        manager.removeComponent(cs[i])
        manager.removeEntity(es[i])
    }
    
    // UI
    cachedMgr = manager
    document.getElementById('testbut').addEventListener('click', onTestButton) 
    
})



// benchmark thingy
var cachedMgr
var testing = false

function onTestButton() {
    if (!testing) {
        startTest()
        out('Running...')
    } else {
        endTest()
        out([ runCt, ' iterations over ', numCs, ' components, ', 
            numEs, ' entities w/ ', numCsPerE, ' components each',
            '<br>init time <b>' + initTime.toFixed(2) + '</b> ms', 
            '<br>average time <b>' + (runTime/runCt).toFixed(2) + '</b> ms',
            '<br>checksum: ' + (runningSum/runCt).toFixed(0) + ' ops/iter'
        ].join(''))
    }
    testing = !testing
    document.getElementById('testbut').innerHTML = (testing) ? "Stop" : "Start"
}
function out(s) {
    document.getElementById('output').innerHTML = s
}



var Es, compNames, initTime, runTime, runCt, runningSum, iterating

function startTest() {
    var t = performance.now()
    var mgr = cachedMgr
    compNames = []
    Es = []
    for (var i=0; i<numCs; ++i) {
        compNames[i] = 'comp_'+String(i)
        var obj = { state: {value:1} }
        obj.state[String(Math.random())] = 1
        mgr.addComponent(compNames[i], obj)
    }
    for (var i=0; i<numEs; ++i) {
        var n = (numCs * Math.random())|0
        var toAdd = []
        for (var j=0; j<numCsPerE; ++j) {
            toAdd.push(compNames[(n+j)%numCs])
        }
        Es.push( mgr.createEntity(toAdd) )
    }
    initTime = performance.now() - t
    iterating = true
    runTime = runCt = runningSum = 0
    requestAnimationFrame(iterateTest)
}
function iterateTest() {
    if (!iterating) return
    var t = performance.now()
    runningSum += sumOverComponents(cachedMgr, compNames)
    runTime += performance.now() - t
    runCt++
    if (iterating) requestAnimationFrame(iterateTest)
}
function sumOverComponents(mgr, cnames) {
    var sum = 0
    for (var i=0; i<cnames.length; ++i) {
        var entList = mgr.getComponentsData(cnames[i])
        var ids = Object.keys(entList)
        for (var j=0; j<ids.length; ++j) {
            sum += entList[ids[j]].value
        }
    }
    return sum|0
}
function endTest() {
    iterating = false
    // tear down
    for (var i=0; i<numCs; ++i) {
        cachedMgr.removeComponent(compNames[i])
    }
    compNames.length = 0
    for (i=0; i<numEs; ++i) {
        cachedMgr.removeEntity(Es[i])
    }
    Es.length = 0
}


