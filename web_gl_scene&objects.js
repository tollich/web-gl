function main() 
{
    var canvas = document.getElementById('gl-canvas');

    var gl = getWebGLContext(canvas);
    if ( !gl ) 
        alert("WebGL isn't available");

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
        alert('Shader initialization failed.');

    setInterval(() => { render(gl) }, 15);
}

camSettings = {
    perspFov:       50,
    perspAspect:    1,
    perspNear:      1,
    perspFar:       15,
    camX:           0,
    camY:           3,
    camZ:           6
}

function render(gl) 
{
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    var viewMatrix = new Matrix4();
    // FOV, Persp, Near, Far // X, Y, Z
    viewMatrix.setPerspective(camSettings.perspFov, camSettings.perspAspect,
                                camSettings.perspNear, camSettings.perspFar)
                      .lookAt(camSettings.camX,  camSettings.camY, camSettings.camZ,
                                0, 0, 0, 0, 1, 0);

    var u_Mvp = gl.getUniformLocation(gl.program, 'u_Mvp');
    gl.uniformMatrix4fv(u_Mvp, false, viewMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (let obj of objects) 
    {
        var n = initBuffers(gl, obj);

        var transformMatrix = new Matrix4();
        transformMatrix 
            .setTranslate(obj.posX, obj.posY, obj.posZ)
            .scale(obj.scale, obj.scale, obj.scale);

        var u_Transform = gl.getUniformLocation(gl.program, 'u_Transform');
        gl.uniformMatrix4fv(u_Transform, false, transformMatrix.elements);

        var rotateMatrix = new Matrix4();
        rotateMatrix.setRotate(obj.isRotating ? obj.angle += 3 : obj.angle, obj.rotX, obj.rotY, obj.rotZ);

        var u_Rotate= gl.getUniformLocation(gl.program, 'u_Rotate');
        gl.uniformMatrix4fv(u_Rotate, false, rotateMatrix.elements);

        var u_Translate = gl.getUniformLocation(gl.program, 'u_Translate');
        gl.uniformMatrix4fv(u_Translate, false, obj.translate);

        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    }
}

function initBuffers(gl, obj) 
{
    var verticesColors = obj.verticesColors
    var indices = obj.indices;

    var vertexColorBuffer = gl.createBuffer();
    var indicesBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return indices.length;
}

//Object Controls
//#region 
function setRot(state, axis) {
    var index = document.getElementById('selectObject').value;
    toggleRotation(objects[index], state, axis)
}

function setPos(axis) {
    var index = document.getElementById('selectObject').value;
    switch(axis)
    {
        case 1:
            var newPosX = document.getElementById('posX').value;
            objects[index].posX = newPosX;
            break;
        case 2:
            var newPosY = document.getElementById('posY').value;
            objects[index].posY = newPosY;
            break;
        case 3:
            var newPosZ = document.getElementById('posZ').value;
            objects[index].posZ = newPosZ;
            break;
    }
}

function setScale() {
    var index = document.getElementById('selectObject').value;
    objects[index].scale = document.getElementById('size').value;
}

//#endregion

function updateCameraSettings(property) {
    var newSettings = parseFloat(document.getElementById(property).value)
    camSettings[property] = newSettings;
}


//Scene objects array
objects = []

function addObject(objectType) 
{
    if (objects.length === 3) 
    {
        alert('You can add only three objects on this canvas. Remove one and try again!');
        return;
    }

    switch (objectType) 
    {
        case 1: 
            objects.push(createCube()); 
            break;
        case 2: 
            objects.push(createPyramid()); 
            break;
        case 3: 
            objects.push(createCylinder()); 
            break;
        case 4: 
            objects.push(createCone()); 
            break;
        default:
            alert("Error! Object type unvalid!");
            break;
    }

    switch(objects.length)
    {
        case 1:
            objects[objects.length - 1].translate = new Matrix4().setTranslate(-2, 0, 0).elements;
            break;
        case 2:
            objects[objects.length - 1].translate = new Matrix4().setTranslate(0, 0, 0).elements;
            break;
        case 3:
            objects[objects.length - 1].translate = new Matrix4().setTranslate(2, 0, 0).elements;
            break;
        default:
            alert("Unexppected Error!");
            break;
    }
    
    fillSelectList();
}

class Object 
{
    constructor(verticesColors, indices) 
    {
        this.verticesColors = verticesColors;
        this.indices = indices;
        this.translate = new Matrix4().setTranslate(0, 0, 0).elements;
        this.scale = 1.0;
        this.posX = 0;
        this.posY = 0;
        this.posZ = 0;

        this.angle = 0;
        this.rotX = 1;
        this.rotY = 0;
        this.rotZ = 0;
        this.isRotating = false;
    }
}

function toggleRotation(object, state, axis)
{
    if(state)
    {
        object.isRotating = true;
        console.log(axis);
        switch(axis)
        {
            case 1:
                applyRotation(object,1,0,0);
                break;
            case 2:
                applyRotation(object,0,1,0);
                break;
            case 3:
                applyRotation(object,0,0,1);
                break;
        }
    }
    else
    {
        object.isRotating = false;
        object.angle = 0;
    }
}

function applyRotation(object, x, y, z)
{
    object.rotX = x;
    object.rotY = y;
    object.rotZ = z;
}

function removeObject(all) 
{
    if (all) objects = [];
    else objects.pop();

    fillSelectList();
}

function fillSelectList()
{
    var selectList = document.getElementById('selectObject')

    for (i = selectList.options.length-1; i >= 0; i--) {
        selectList.options[i] = null;
    }

    for(i=0; i<objects.length; i++)
    {
        var opt = document.createElement("option");
        opt.text = i+1;
        opt.value = i;
        selectList.options.add(opt);
    }

    selectList.value = objects.length-1;

    var objControls = document.getElementById("object-controls");
    if(objects.length > 0)
        objControls.style.display = "block";
    else
        objControls.style.display = "none";
}

//Cube Function
function createCube() 
{
    return new Object(
        new Float32Array([
            0.5, 0.5, 0.5, 1, 1, 1,         // vertice0 White
            -0.5, 0.5, 0.5, 1, 0, 1,        // vertice1 Magenta
            -0.5, -0.5, 0.5, 1, 0, 0,       // vertice2 Red
            0.5, -0.5, 0.5,  1, 1, 0,       // vertice3 Yellow
            0.5, -0.5, -0.5,  0, 1, 0,      // vertice4 Green
            0.5, 0.5, -0.5, 0, 1, 1,        // vertice5 Cyan
            -0.5, 0.5, -0.5,  0, 0, 1,      // vertice6 Blue
            -0.5, -0.5, -0.5,  0, 0, 0,     // vertice7 Black
        ]),
        new Uint8Array([
            0, 1, 2, 0, 2, 3,    // front
            0, 3, 4, 0, 4, 5,    // right
            0, 5, 6, 0, 6, 1,    // up
            1, 6, 7, 1, 7, 2,    // left
            7, 4, 3, 7, 3, 2,    // down
            4, 7, 6, 4, 6, 5     // back
        ])
    );
}


//Pyramid Function
function createPyramid() 
{
    return new Object(
        new Float32Array([
            0.0, 0.5, 0.0, 1, 1, 1,         // vertice0 White
            -0.5, -0.5, 0.5, 1, 0, 1,       // vertice1 Magenta
            0.5, -0.5, 0.5, 1, 0, 0,        // vertice2 Red
            0.5, -0.5, -0.5, 1, 1, 0,       // vertice3 Yellow
            -0.5, -0.5, -0.5, 0, 1, 0,      // vertice4 Green
        ]),
        new Uint8Array([
            0, 1, 2,            // front
            0, 2, 3,            // right
            0, 1, 4,            // left
            0, 3, 4,            // back
            1, 2, 4, 2, 3, 4    // down
        ])
    );
}

//Cylinder Function
function createCylinder() 
{
    var verticesColors = [];
    var indices = []
    const sectors = 2 * Math.PI / 64;
    var angle;

    for (let i = 0; i < 64; i += 2) 
    {
        angle = i * sectors;
        verticesColors.push(Math.cos(angle) / 2);
        verticesColors.push(0.5);
        verticesColors.push(Math.sin(angle) / 2);
        verticesColors.push(1, 0, 1);
        
            
        verticesColors.push(Math.cos(angle) / 2);
        verticesColors.push(-0.5);
        verticesColors.push(Math.sin(angle) / 2);
        verticesColors.push(1, 1, 0);
        

        if (i % 2 === 0 && i <= 63)
            indices.push(i , i + 1, i + 2, i + 1, i + 3, i + 2);
            indices.push(64, i, i + 2);
            indices.push(65, i + 1 , i + 3);
    }

    verticesColors.push(0, 0.5, 0, 1, 0, 1);
    verticesColors.push(0, -0.5, 0, 1, 1, 0);

    indices.push(98, 99, 0, 99, 1, 0)
    indices.push(100, 98, 0)
    indices.push(101, 99, 1);

    return new Object(
        new Float32Array(verticesColors),
        new Uint8Array(indices)
    );
}

//Cone Function
function createCone() 
{
    var verticesColors = [];
    var indices = []
    const sectors = 2 * Math.PI / 16;
    var angle;


    verticesColors.push(0, 0.5, 0, 1, 0, 1);

    for (let i = 0; i < 16; i++) 
    {
        angle = i * sectors;
            
        verticesColors.push(Math.cos(angle) / 2);
        verticesColors.push(-0.5);
        verticesColors.push(Math.sin(angle) / 2);
        verticesColors.push(1, 1, 0);
        
        if (i <= 16)
            indices.push(0, i, i + 1);
            indices.push(16, i, i + 1);
    }

    verticesColors.push(0, -0.5, 0, 1, 1, 0);
    indices.push(0, 15, 1)

    return new Object(
        new Float32Array(verticesColors),
        new Uint8Array(indices)
    );
}

//Shaders

//Vertex Shader
var VSHADER_SOURCE =
    `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_Mvp;
    uniform mat4 u_Transform;
    uniform mat4 u_Rotate;
    uniform mat4 u_Translate;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_Mvp * u_Translate * u_Transform * u_Rotate * a_Position;
        v_Color = a_Color;
    }`;

//Fragment Shader
var FSHADER_SOURCE =
    `
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
  }`;