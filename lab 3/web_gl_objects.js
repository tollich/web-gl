
class Figure {
    constructor(vertices, indices, colors, normals) {
        this.vertices = vertices;
        this.colors = colors
        this.indices = indices;
        if (normals == null) this.normals = vertices;
        else this.normals = normals;
        

        this.angle = 0;
        this.rotateX = 1;
        this.rotateY = 0;
        this.rotateZ = 0;
        this.rotate = false;
        this.defaultTranslate = [0, 0, 0];

        this.scale = 1.0;

        this.moveX = 0;
        this.moveY = 0;
        this.moveZ = 0;
    }

    enableRotation(rotateX, rotateY, rotateZ) {
        this.rotate = true;
        this.rotateX = rotateX;
        this.rotateY = rotateY;
        this.rotateZ = rotateZ;
    }

    disableRotation() {
        this.rotate = false;
        this.angle = 0;
    }
}

class FigureWithTexture {
    constructor(vertices, indices, normals, textures) {
        this.vertices = vertices;
        this.normals = normals;
        this.indices = indices;
        this.textures = textures;

        let col = [];
        vertices.forEach(v => col.push(1, 1, 1));
        this.colors = new Uint8Array(col);
        
        this.angle = 0;
    }
}

function createCube() {
    return new Figure(
        new Float32Array([
            0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // v0-v1-v2-v3 front
            0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5, // v0-v3-v4-v5 right
            0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
           -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5, // v1-v6-v7-v2 left
           -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // v7-v4-v3-v2 down
            0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5 
        ]),
        new Uint8Array([
            0, 1, 2,   0, 2, 3,    // front
            4, 5, 6,   4, 6, 7,    // right
            8, 9,10,   8,10,11,    // up
            12,13,14,  12,14,15,    // left
            16,17,18,  16,18,19,    // down
            20,21,22,  20,22,23     // back
        ]),
        new Float32Array([
            1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v1-v2-v3 front
            1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v3-v4-v5 right
            1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v5-v6-v1 up
            1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v6-v7-v2 left
            1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v7-v4-v3-v2 down
            1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1　 
        ])
    );
}

function createPyramid() {
    return new Figure(
        new Float32Array([
            0.0, 0.5, 0.0,  // v0
            -0.5, -0.5, 0.5, // v1
            0.5, -0.5, 0.5,  // v2
            0.5, -0.5, -0.5,  // v3
            -0.5, -0.5, -0.5  // v4
        ]),
        new Uint8Array([
            0, 1, 2,  // front
            0, 2, 3,  // right
            0, 1, 4,  // left
            0, 3, 4,  // back
            1, 2, 4, 2, 3, 4  // down
        ]),
        new Float32Array([
            1, 1, 1,  // v0 White
            1, 1, 1,  // v1 Magenta
            1, 1, 1,  // v2 Red
            1, 1, 1,  // v3 Yellow
            1, 1, 1,  // v4 Green
        ]),
    );
}

function createCylinder() {
    points = 36 ;
    var vertices = [];
    var colors = [];
    var indices = [];
    const sectors = 2 * Math.PI / points;
    var angle;

    for (let i = 0; i < points; i += 2) {
        angle = i * sectors;
        vertices.push(Math.cos(angle) / 2);
        vertices.push(0.5);
        vertices.push(Math.sin(angle) / 2);
        colors.push(1, 1, 1);
        
            
        vertices.push(Math.cos(angle) / 2);
        vertices.push(-0.5);
        vertices.push(Math.sin(angle) / 2);
        colors.push(1, 1, 1);
        

        if (i % 2 === 0 && i <= points - 4)
            indices.push(i , i + 1, i + 2, i + 1, i + 3, i + 2);
            indices.push(points, i, i + 2);
            indices.push(points + 1, i + 1 , i + 3);
    }

    vertices.push(0, 0.5, 0);
    colors.push(1, 1, 1);
    vertices.push(0, -0.5, 0);
    colors.push(1, 1, 1)

    indices.push(points - 2, points - 1, 0)
    indices.push(points - 1, 1, 0)
    indices.push(points, points - 2, 0)
    indices.push(points + 1, points - 1, 1);

    return new Figure(
        new Float32Array(vertices),
        new Uint8Array(indices),
        new Float32Array(colors)
    );
}

function createConus() {
    points = 22;
    var vertices = [];
    var colors = [];
    var indices = [];
    const sectors = 2 * Math.PI / points;
    var angle;

    vertices.push(0, 0.5, 0);
    colors.push(1, 1, 1)
    for (let i = 0; i < points; i++) {
        angle = i * sectors;
            
        vertices.push(Math.cos(angle) / 2);
        vertices.push(-0.5);
        vertices.push(Math.sin(angle) / 2);
        colors.push(1, 1, 1);
        

        if (i <= points - 2)
            indices.push(0, i, i + 1);
            indices.push(points, i, i + 1);
    }

    vertices.push(0, -0.5, 0);
    colors.push(1, 1, 1);
    indices.push(0, points - 1, 1);

    return new Figure(
        new Float32Array(vertices),
        new Uint8Array(indices),
        new Float32Array(colors)
    );
}

function createSphere() {
    var SPHERE_DIV = 15;
    var positions = [];
    var indices = [];
    var colors = [];

      // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++) {
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            positions.push((si * sj)/1.5);  // X
            positions.push(cj/1.5);       // Y
            positions.push((ci * sj)/1.5);  // Z

            if (i % 2 === 0) colors.push(1, 1, 1);
            else colors.push(1, 1, 1)
            
        }
    }

    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
            p1 = j * (SPHERE_DIV+1) + i;
            p2 = p1 + (SPHERE_DIV+1);

            indices.push(p1);
            indices.push(p2);
            indices.push(p1 + 1);

            indices.push(p1 + 1);
            indices.push(p2);
            indices.push(p2 + 1);
        }
    }

    return new Figure(
        new Float32Array(positions),
        new Uint8Array(indices),
        new Float32Array(colors)
    )
}