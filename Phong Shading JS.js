"use strict";

var prog3 = function() {

var canvas;
var gl;
var program;

var indexLand = 0;
var indexSphere = 0;
var positionsArray = [];

var near = -10;
var far = 10;
var radius = 6.0;
var theta = 1.0;
var phi = 1.0;
var dr = 5.0 * Math.PI/180.0;

var left = -2.0;
var right = 2.0;
var top = 2.0;
var bottom = -2.0;

var modelViewMatrix, modelViewMatrixSphere1, modelViewMatrixSphere2, modelViewMatrixMesh, modelViewMatrixCone, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, nMatrixLoc, eyeLoc;
var nMatrix, nMatrixC, nMatrixM;
var translationMatrix, rotationMatrix, scaleMatrix;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var recursions = 32/////////////////////
var positionsArray = [];
var faceNormalsArray = [];
var vertNormalsArray = [];
// ********** Sphere Variables Declaration ********** //
var thetaOrbit = 0;
var thetaSpeed = 1;
var orbitR = .48;
var aOrbit = [1,0,0];
var bOrbit = [0,1,0];
var sp = 1;
var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);

var originTranslate = [-1.0, 0.0, -1.0];

var mesh1Rotate = [0.0,0.0,0.0];
var mesh1Translate = [-0.5,0.0, -0.5];
var mesh1Scale = [1.0, 1.0, 1.0];
var meshAmbient = vec4(0.1, 0.1, 0.1, 1.0);
var meshDiffuse = vec4(0.5, 0.0, 0.2, 1.0);
var meshSpecular = vec4(0.6, 0.6, 0.6, 1.0);

var sphere1Rotate = [0.0,0.0,0.0];
var sphere1Translate = [0.0,0.1,0.0];
var sphere1Scale = [.2, .2, .2];
var sphere1Ambient = vec4(0.1, 0.1, 0.1, 1.0);
var sphere1Diffuse = vec4(0.1, 0.2, 0.8, 1.0);
var sphere1Specular = vec4(0.9, 0.9, 0.9, 1.0);
var sphere2Ambient = vec4(0.1, 0.1, 0.1, 1.0);
var sphere2Diffuse = vec4(0.1, 0.8, 0.2, 1.0);
var sphere2Specular = vec4(0.9, 0.9, 0.9, 1.0);
// ********** Mesh Variables Declaration ********** //
var vertices = [
        vec4(-1.0, 0,  1.0, 1.0),
        vec4(1.0,  0,  1.0, 1.0),
        vec4(1.0,  0,  -1.0, 1.0),
        vec4(-1.0, 0,  -1.0, 1.0),
    ];
var meshPointsArray = []
// ********** Cone Variables Declaration ********** //
var coneStartIndex;
var coneEndIndex;
var cone1Rotate = [0.0,0.0,0.0];
var cone1Translate = [0.0,0.0,0.0];
var cone1Scale = [0.1, 0.4, 0.1];
var coneAmbient = vec4(0.9, 0.8, 0.5, 1.0);
var coneDiffuse = vec4(0.9, 0.8, 0.5, 1.0);
var coneSpecular = vec4(0.6, 0.6, 0.6, 1.0);
// ********** Shading Variables Declaration ********** //
var lightPosition = vec4(1.0, 1.5, 0.0, 1.0);
var lightAmbient = vec4(0.8, 0.8, 0.8, 1.0);
var lightDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.1, 0.1, 0.1, 1.0);
var materialDiffuse = vec4(0.5, 0.0, 0.2, 1.0);
var materialSpecular = vec4(0.6, 0.6, 0.6, 1.0);
var materialShininess = 200.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var ambientProduct, diffuseProduct, specularProduct;
var lightPositionLoc, ambientProductLoc, diffuseProductLoc, specularProductLoc, shininessLoc;
init();

// ********** Start Landscape Drawing ********** //
function computeMeshNormals(size)
{
    for(var i = 0; i < size; ++i)
    {
        for(var j = 0; j < size; ++j)
        {
            var t = 0.5;
            var v1 = mix(faceNormalsArray[i], faceNormalsArray[i+1], 0.5)
            vertNormalsArray.push(v1);
            vertNormalsArray.push(v1);                                
            vertNormalsArray.push(v1);                                
            vertNormalsArray.push(v1);
        }                                                                
    }
}

function triangleMesh(a, b, c) 
{

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t2, t1));
     normal = vec4(normal[0], normal[1], normal[2], 0.0);

     faceNormalsArray.push(normal);
     faceNormalsArray.push(normal);
     faceNormalsArray.push(normal);

     positionsArray.push(a);
     positionsArray.push(b);
     positionsArray.push(c);
     indexLand += 3;
}

function quad(a, b, c, d) 
{
     triangleMesh(a,d,c);
     triangleMesh(a,c,b);
}


function divideMesh(a,b,c,d,size)
{
    var heightArray = new Array(size);
    for(var i = 0; i <= size; ++i)
    {
        heightArray[i] = new Array(size);
    }

    for(var i = 0; i < size; ++i)
    {
        var x = Math.PI * (4*1/size-2.0);
        for(var j = 0; j < size; ++j)
        {
            var X = (2*j/(size-1) - 1)*10;
            var Z = (2*i/(size-1) - 1)*10;
            heightArray[i][j] = Math.sin(Math.sqrt(Math.pow(X, 2)+ Math.pow(Z, 2))) / Math.sqrt(Math.pow(X, 2)+ Math.pow(Z, 2));//(r != 0 ? Math.sin(r)/r : 1.0);
        }
    }

    for(var i = 0; i < size-1; ++i)
    {
        for(var j = 0; j < size-1; ++j)
        {
            var A = vec4(2*i/(size-1), heightArray[i][j], 2*j/(size-1), 1.0);
            var B = vec4(2*(i+1)/(size-1), heightArray[i+1][j], 2*j/(size-1), 1.0);
            var C = vec4(2*(i+1)/(size-1), heightArray[i+1][j+1], 2*(j+1)/(size-1), 1.0);
            var D = vec4(2*i/(size-1), heightArray[i][j+1], 2*(j+1)/(size-1), 1.0);

            quad(A,D,C,B);            
        }
    }
}

// ********** End Landscape Drawing ********** //

// ********** Start Sphere Drawing ********** //
//From Textbook Example Sphere4
function triangle(a, b, c) 
{
     faceNormalsArray.push(vec4(a[0],a[1], a[2], 0.0));
     faceNormalsArray.push(vec4(b[0],b[1], b[2], 0.0));
     faceNormalsArray.push(vec4(c[0],c[1], c[2], 0.0));

     positionsArray.push(a);
     positionsArray.push(b);
     positionsArray.push(c);

     indexSphere += 3;
}
//From Textbook Example Sphere4
function divideTriangle(a, b, c, count) 
{
    if (count > 0) 
    {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else 
    {
        triangle(a, b, c );
    }
}
//From Textbook Example Sphere4
function createSphere(a, b, c, d, n) 
{
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}
// ********** End Sphere Drawing ********** //

// ********** Start Axis Drawing ********** //
function createAxis()
{
    var o = [0.0,0.0,0.0,1.0];
    var x = [2.0,0.0,0.0,1.0];
    var y = [0.0,2.0,0.0,1.0];
    var z = [0.0,0.0,2.0,1.0];
    positionsArray.push(o);
    positionsArray.push(x);
    positionsArray.push(o);
    positionsArray.push(y);
    positionsArray.push(o);
    positionsArray.push(z);
    faceNormalsArray.push(o);
    faceNormalsArray.push(x);
    faceNormalsArray.push(o);
    faceNormalsArray.push(y);
    faceNormalsArray.push(o);
    faceNormalsArray.push(z);
}
// ********** End Axis Drawing ********** //

// ********** Start Cone Drawing ********** //

function createCone()
{
    coneStartIndex = positionsArray.length;
    var size = 20;
    var PI = 3.1415926;
    var sectorStep = 2 * PI / size;
    var sectorAngle1, sectorAngle2;
    for(var i =  0; i < size; i++)
    {
        sectorAngle1 = (i * sectorStep);
        sectorAngle2 = ((i+1) * sectorStep);
        var a = [0.0, 1.0, 0.0, 1.0];
        var b = [Math.cos(sectorAngle2)*aOrbit[0] + Math.sin(sectorAngle2)*bOrbit[0], 0.0 ,  Math.cos(sectorAngle2)*aOrbit[1] + Math.sin(sectorAngle2)*bOrbit[1], 1.0];
        var c = [Math.cos(sectorAngle1)*aOrbit[0] + Math.sin(sectorAngle1)*bOrbit[0], 0.0 ,  Math.cos(sectorAngle1)*aOrbit[1] + Math.sin(sectorAngle1)*bOrbit[1], 1.0];
        triangleCone(a,b,c);
    }
    coneEndIndex = positionsArray.length;
}

//From Textbook Example Sphere4
function triangleCone(a, b, c) 
{
     faceNormalsArray.push(vec4(a[0],a[1], a[2], 0.0));
     faceNormalsArray.push(vec4(b[0],b[1], b[2], 0.0));
     faceNormalsArray.push(vec4(c[0],c[1], c[2], 0.0));

     positionsArray.push(a);
     positionsArray.push(b);
     positionsArray.push(c);
}
// ********** End Cone Drawing ********** //


function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    updateLightProducts();

    divideMesh(vertices[0], vertices[1], vertices[2], vertices[3], recursions);
    createSphere(va, vb, vc, vd, 4);
    createAxis();
    createCone();
     
    // normal array atrribute buffer
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(faceNormalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( normalLoc);

    // vertex array atrribute buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

     document.getElementById("MoveLightX").onchange = function(event) 
     {
        lightPosition[0] = event.target.value;
        indexSphere = 0;
        indexLand = 0;
        positionsArray = [];
        faceNormalsArray = [];
        vertNormalsArray = [];
        thetaSpeed++;
        init();
     }
    document.getElementById("Button0").onclick = function(){theta += dr;};
    document.getElementById("Button1").onclick = function(){theta -= dr;};
    document.getElementById("Button2").onclick = function(){phi += dr;};
    document.getElementById("Button3").onclick = function(){phi -= dr;};
    document.getElementById("Button4").onclick = function(){
        recursions++;
        indexSphere = 0;
        indexLand = 0;
        positionsArray = [];
        faceNormalsArray = [];
        vertNormalsArray = [];
        thetaSpeed++;
        init();
    };
    document.getElementById("Button5").onclick = function(){
        if(recursions > 1) recursions--;
        indexSphere = 0;
        indexLand = 0;
        positionsArray = [];
        faceNormalsArray = [];
        vertNormalsArray = [];
        thetaSpeed++;
        init();
    };

    document.getElementById("MeshAmbient").onchange = function(event){meshAmbient = vec4(hexToRgb(event.target.value).r / 255, hexToRgb(event.target.value).g / 255, hexToRgb(event.target.value).b / 255, 0.0);} 
    document.getElementById("MeshDiffuse").onchange = function(event){meshDiffuse = vec4(hexToRgb(event.target.value).r / 255, hexToRgb(event.target.value).g / 255, hexToRgb(event.target.value).b / 255, 0.0);} 
    document.getElementById("MeshSpecular").onchange = function(event){meshSpecular = vec4(hexToRgb(event.target.value).r / 255, hexToRgb(event.target.value).g / 255, hexToRgb(event.target.value).b / 255, 0.0);} 

    document.getElementById("Sphere1Ambient").onchange = function(event){sphere1Ambient = vec4(hexToRgb(event.target.value).r / 255, hexToRgb(event.target.value).g / 255, hexToRgb(event.target.value).b / 255, 0.0);} 
    document.getElementById("Sphere1Diffuse").onchange = function(event){sphere1Diffuse = vec4(hexToRgb(event.target.value).r / 255, hexToRgb(event.target.value).g / 255, hexToRgb(event.target.value).b / 255, 0.0);} 
    document.getElementById("Sphere1Specular").onchange = function(event){sphere1Specular = vec4(hexToRgb(event.target.value).r / 255, hexToRgb(event.target.value).g / 255, hexToRgb(event.target.value).b / 255, 0.0);} 

    document.getElementById("Sphere2Ambient").onchange = function(event){sphere2Ambient = vec4(hexToRgb(event.target.value).r / 255, hexToRgb(event.target.value).g / 255, hexToRgb(event.target.value).b / 255, 0.0);} 
    document.getElementById("Sphere2Diffuse").onchange = function(event){sphere2Diffuse = vec4(hexToRgb(event.target.value).r / 255, hexToRgb(event.target.value).g / 255, hexToRgb(event.target.value).b / 255, 0.0);} 
    document.getElementById("Sphere2Specular").onchange = function(event){sphere2Specular = vec4(hexToRgb(event.target.value).r / 255, hexToRgb(event.target.value).g / 255, hexToRgb(event.target.value).b / 255, 0.0);} 

// ********** Shader Variable Assignment ********** //
    gl.uniform4fv( gl.getUniformLocation(program,"uAmbientProduct"),flatten(ambientProduct));
    gl.uniform4fv( gl.getUniformLocation(program,"uDiffuseProduct"),flatten(diffuseProduct));
    gl.uniform4fv( gl.getUniformLocation(program,"uSpecularProduct"),flatten(specularProduct));
    gl.uniform4fv( gl.getUniformLocation(program,"uLightPosition"),flatten(lightPosition));
    gl.uniform1f( gl.getUniformLocation(program,"uShininess"),materialShininess);

    ambientProductLoc = gl.getUniformLocation(program,"uAmbientProduct");
    diffuseProductLoc = gl.getUniformLocation(program,"uDiffuseProduct");
    specularProductLoc = gl.getUniformLocation(program,"uSpecularProduct");
    lightPositionLoc = gl.getUniformLocation(program, "uLightPosition");
    shininessLoc = gl.getUniformLocation(program,"uShininess");
    render();
}


function render() 
{
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, top, near, far);
    nMatrix = normalMatrix(modelViewMatrix, true ); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform4fv(lightPositionLoc, lightPosition); 

   // ********** Landscape Drawing ********** //
    materialAmbient = meshAmbient;
    materialDiffuse = meshDiffuse;
    materialSpecular = meshSpecular;
    updateLightProducts();
    gl.uniform4fv(ambientProductLoc, ambientProduct); 
    gl.uniform4fv(diffuseProductLoc, diffuseProduct);
    gl.uniform4fv(specularProductLoc, specularProduct);

    modelViewMatrixMesh = mult(modelViewMatrix, translate(originTranslate[0], originTranslate[1], originTranslate[2]));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrixMesh));   
    gl.clear(gl.DEPTH_BUFFER_BIT);  
    for( var i=0; i<indexLand; i+=3)
        gl.drawArrays(gl.TRIANGLES, i, 3);

    // ********** Axis Drawing ********** //
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));
    gl.drawArrays(gl.LINES, indexLand + indexSphere, 6);

    // ********** Sphere1 Drawing ********** //
    materialAmbient = sphere1Ambient;
    materialDiffuse = sphere1Diffuse;
    materialSpecular = sphere1Specular;
    updateLightProducts();
    gl.uniform4fv(ambientProductLoc, ambientProduct); 
    gl.uniform4fv(diffuseProductLoc, diffuseProduct);
    gl.uniform4fv(specularProductLoc, specularProduct); 

    modelViewMatrixSphere1 = mult(modelViewMatrix, translate(sphere1Translate[0], sphere1Translate[1], sphere1Translate[2])); 
    modelViewMatrixSphere1 = mult(modelViewMatrixSphere1, scale(sphere1Scale[0], sphere1Scale[1], sphere1Scale[2]));   
    nMatrix = normalMatrix(modelViewMatrixSphere1, true ); 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrixSphere1));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));
    for( var i = indexLand; i < indexSphere + indexLand; i+=3)
        gl.drawArrays(gl.TRIANGLES, i, 3);

    // ********** Sphere2 Drawing ********** //
    materialAmbient = sphere2Ambient;
    materialDiffuse = sphere2Diffuse;
    materialSpecular = sphere2Specular;
    updateLightProducts();
    gl.uniform4fv(ambientProductLoc, ambientProduct); 
    gl.uniform4fv(diffuseProductLoc, diffuseProduct);
    gl.uniform4fv(specularProductLoc, specularProduct);

    modelViewMatrixSphere2 = mult(modelViewMatrix, translate((-1.0 * sphere1Translate[0]), sphere1Translate[1], (-1.0 * sphere1Translate[2])));
    modelViewMatrixSphere2 = mult(modelViewMatrixSphere2, scale(sphere1Scale[0], sphere1Scale[1], sphere1Scale[2]));   
    nMatrix = normalMatrix(modelViewMatrixSphere2, true ); 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrixSphere2));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));
    for( var i = indexLand; i < indexSphere + indexLand; i+=3)
        gl.drawArrays(gl.TRIANGLES, i, 3);

    // ********** Cone Drawing ********** //
    materialAmbient = coneAmbient;
    materialDiffuse = coneDiffuse;
    materialSpecular = coneSpecular;
    updateLightProducts();
    gl.uniform4fv(ambientProductLoc, ambientProduct); 
    gl.uniform4fv(diffuseProductLoc, diffuseProduct);
    gl.uniform4fv(specularProductLoc, specularProduct);
    
    cone1Translate = lightPosition;
    modelViewMatrixCone = mult(modelViewMatrix, translate(cone1Translate[0], cone1Translate[1], cone1Translate[2]));
    modelViewMatrixCone = mult(modelViewMatrixCone, scale(cone1Scale[0], cone1Scale[1], cone1Scale[2]));
    nMatrix = normalMatrix(modelViewMatrixCone, true ); 
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrixCone));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));
    for( var i = coneStartIndex; i < coneEndIndex; i+=3)
        gl.drawArrays(gl.TRIANGLES, i, 3);

    updateSphere();
    thetaOrbit += .25
    requestAnimationFrame(render);
}

function updateSphere()
{
    var PI = 3.1415926;
    var sectorStep = 2 * PI / 100;
    var sectorAngle;
    
    sectorAngle = (thetaOrbit * sectorStep)/thetaSpeed;
    sphere1Translate[0] = orbitR*(Math.cos(sectorAngle))*aOrbit[0] + orbitR*(Math.sin(sectorAngle))*bOrbit[0];
    sphere1Translate[2] = orbitR*(Math.cos(sectorAngle))*aOrbit[1] + orbitR*(Math.sin(sectorAngle))*bOrbit[1];

}

function updateLightProducts()
{
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
}


// hex to RGB code from: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
    {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
    } 
: null;
}

}
prog3();

