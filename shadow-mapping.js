//Create Shadowmap Rendering Program
const CreateShadowProgram = (gl) => {

    let shadowVertScript = document.getElementById("shadowmap_vert").textContent;
    let shadowFragScript = document.getElementById("shadowmap_frag").textContent;

    //Create volumetrics shaders
    let vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, shadowVertScript);
    gl.compileShader(vertShader);

    let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, shadowFragScript);
    gl.compileShader(fragShader);


    //Creat postprocessing program and link shaders
    let shadowProgram = gl.createProgram();
    gl.attachShader(shadowProgram, vertShader);
    gl.attachShader(shadowProgram, fragShader);

    gl.linkProgram(shadowProgram);

    if ( !gl.getProgramParameter( shadowProgram, gl.LINK_STATUS) ) {
        var info = gl.getProgramInfoLog(shadowProgram);
        throw new Error('Could not compile WebGL program. \n\n' + info);
      }

    //get uniform locations 
    const uniforms = 
    [ "projection", "modelview" ]
      .reduce( (acc, current) => {

        return {
            ...acc,
            [current]: gl.getUniformLocation(shadowProgram, current)
        }
      }, {});

    return {
        program: shadowProgram,
        uniforms: uniforms
    }

}

const DrawShadowMap = (graphicsState, model_transform, gl, shape) => {

    //console.log(vertices);
    let shadowmapProgram = graphicsState.shadowmapBundle.program;
    let uniforms = graphicsState.shadowmapBundle.uniforms;

    /* Activate the post processing program and set uniform values */
    gl.useProgram(shadowmapProgram);

    let M = model_transform;

    //get orthographic projection
    let P = Mat4.orthographic(-150,150,-150,150,-300,300);
    //let P = Mat4.orthographic(-40,40,-40,40,-40,80);
    //get light view matrix
    let C = Mat4.look_at(graphicsState.sunPosition, Vec.of(0,0,0), Vec.of(0,1,0));
    //let C = Mat4.look_at(Vec.of(2,2,-3), Vec.of(0,0,0), Vec.of(0,1,0));
    let CM  =  C.times(M);
    gl.uniformMatrix4fv(uniforms.projection, false, Mat.flatten_2D_to_1D(P.transposed()));
    gl.uniformMatrix4fv(uniforms.modelview, false, Mat.flatten_2D_to_1D( CM.transposed() ));

    //console.log(shape);
    //create buffers for positions and indices
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Mat.flatten_2D_to_1D(shape.positions)), gl.STATIC_DRAW)
    
    

    let indexBuffer = gl.createBuffer();
    if(shape.indexed){
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(shape.indices), gl.STATIC_DRAW);

    }

    gl.bindBuffer(gl.ARRAY_BUFFER, shape.array_names_mapping_to_WebGLBuffers.positions);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.index_buffer);

    // Get the attribute location
    let positionAttrib = gl.getAttribLocation(shadowmapProgram, "aPosition");

    // Point an attribute to the currently bound VBO
    gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0); 
    
    // Enable the attribute
    gl.enableVertexAttribArray(positionAttrib);

    if(shape.indexed){
        
        gl.drawElements(gl.TRIANGLES, shape.indices.length, gl.UNSIGNED_INT, 0);
    }
    else{
        gl.drawArrays(gl.TRIANGLES, 0, shape.positions.length);
    }


}