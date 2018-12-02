/* This function takes in an array of file locations 
    and returns */

const LoadSkyBoxTextures = (gl, filenames ) => {

    
    function loadCubemapFace(gl, target, texture, url) {
        var image = new Image();
        image.onload = function() {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        }
        image.src = url;
    };
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    let skyboxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    loadCubemapFace(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_X, skyboxTexture, filenames[5]);
    loadCubemapFace(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, skyboxTexture, filenames[4]);
    loadCubemapFace(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, skyboxTexture, filenames[2]);
    loadCubemapFace(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, skyboxTexture, filenames[3]);
    loadCubemapFace(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, skyboxTexture, filenames[0]);
    loadCubemapFace(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, skyboxTexture, filenames[1]);
    
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); 
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); 
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); 
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); 
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); 
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); 
    return skyboxTexture;
}

CreateSkyboxProgram = (gl) => {
   
    let skyboxVertScript = document.getElementById("skybox_vert").textContent;
    let skyboxFragScript = document.getElementById("skybox_frag").textContent;

    //Create volumetrics shaders
    let vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, skyboxVertScript);
    gl.compileShader(vertShader);

    let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, skyboxFragScript);
    gl.compileShader(fragShader);


    //Creat postprocessing program and link shaders
    let skyboxProgram = gl.createProgram();
    gl.attachShader(skyboxProgram, vertShader);
    gl.attachShader(skyboxProgram, fragShader);

    gl.linkProgram(skyboxProgram);

    if ( !gl.getProgramParameter( skyboxProgram, gl.LINK_STATUS) ) {
        var info = gl.getProgramInfoLog(skyboxProgram);
        throw new Error('Could not compile WebGL program. \n\n' + info);
      }

    //get uniform locations 
    const uniforms = 
    [ "projection", "view", "skyboxTex"]
      .reduce( (acc, current) => {

        return {
            ...acc,
            [current]: gl.getUniformLocation(skyboxProgram, current)
        }
      }, {});

    return {
        program: skyboxProgram,
        uniforms: uniforms
    }

}

const RenderSkyBox = (gl, skyboxBundle, graphicsState, skyboxTexture) => {

    let skyboxProgram = skyboxBundle.program;
    let uniforms = skyboxBundle.uniforms;

    //vertices for a rectangle that covers the entire viewport
    var vertices = [
        -500.0,  500.0, -500.0,
        -500.0, -500.0, -500.0,
         500.0, -500.0, -500.0,
         500.0, -500.0, -500.0,
         500.0,  500.0, -500.0,
        -500.0,  500.0, -500.0,
        
        -500.0, -500.0,  500.0,
        -500.0, -500.0, -500.0,
        -500.0,  500.0, -500.0,
        -500.0,  500.0, -500.0,
        -500.0,  500.0,  500.0,
        -500.0, -500.0,  500.0,
        
         500.0, -500.0, -500.0,
         500.0, -500.0,  500.0,
         500.0,  500.0,  500.0,
         500.0,  500.0,  500.0,
         500.0,  500.0, -500.0,
         500.0, -500.0, -500.0,
         
        -500.0, -500.0,  500.0,
        -500.0,  500.0,  500.0,
         500.0,  500.0,  500.0,
         500.0,  500.0,  500.0,
         500.0, -500.0,  500.0,
        -500.0, -500.0,  500.0,
        
        -500.0,  500.0, -500.0,
         500.0,  500.0, -500.0,
         500.0,  500.0,  500.0,
         500.0,  500.0,  500.0,
        -500.0,  500.0,  500.0,
        -500.0,  500.0, -500.0,
        
        -500.0, -500.0, -500.0,
        -500.0, -500.0,  500.0,
         500.0, -500.0, -500.0,
         500.0, -500.0, -500.0,
        -500.0, -500.0,  500.0,
         500.0, -500.0,  500.0
       
     ];
     //console.log(vertices.length);
     // Create an empty buffer object to store vertex buffer
     var vertex_buffer = gl.createBuffer();

     // Bind appropriate array buffer to it
     gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
     
     // Pass the vertex data to the buffer
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

     // Unbind the buffer
     gl.bindBuffer(gl.ARRAY_BUFFER, null);

     /* Activate the post processing program and set uniform values */
     gl.useProgram(skyboxProgram);

     let [P, C] = [graphicsState.projection_transform, graphicsState.camera_transform.copy()];

     C[0][3] = 0;
     C[1][3] = 0;
     C[2][3] = 0;
     C[3][3] = 1;
     C[3][0] = 0;
     C[3][1] = 0;
     C[3][2] = 0;

     PC = P.times(C);
   
     gl.uniformMatrix4fv(uniforms.projection, false, Mat.flatten_2D_to_1D(PC.transposed()));
     gl.uniformMatrix4fv(uniforms.camera, false, Mat.flatten_2D_to_1D( C .transposed() ));
     gl.uniform1i(uniforms.skyboxTex, 1);


     /*======= Associating shaders to buffer objects =======*/

     // Bind vertex buffer object
     gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);


     // Get the attribute location
     var coord = gl.getAttribLocation(skyboxProgram, "aPosition");

     // Point an attribute to the currently bound VBO
     gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0); 
     
     // Enable the attribute
     gl.enableVertexAttribArray(coord);

     /*=========Draw the skybox ===========*/

     // Clear the canvas
     //gl.clearColor(0.0, 0.0, 1.0, 1.0);

     //Disable the depth test
     //gl.disable(gl.DEPTH_TEST);

  
     gl.activeTexture(gl.TEXTURE1);
     
     gl.bindTexture (gl.TEXTURE_CUBE_MAP, skyboxTexture);

     //Draw the skybox
     gl.drawArrays(gl.TRIANGLES, 0, 36);
    

     //gl.enable(gl.DEPTH_TEST);
    
}
