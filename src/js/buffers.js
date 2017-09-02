buffers = {
  cube: {
    position: gl_createArrayBuffer([    
      -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, // Front face    
      -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, // Back face    
      -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1, // Top face    
      -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, // Bottom face    
      1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, // Right face    
      -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1 // Left face
    ]),
    normal: gl_createArrayBuffer([    
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // Front face    
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // Back face   
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // Top face    
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // Bottom face    
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // Right face    
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 // Left face
    ]),
    texture: gl_createArrayBuffer([    
      0, 0, 1, 0, 1, 1, 0, 1, // Front face   
      1, 0, 1, 1, 0, 1, 0, 0, // Back face   
      0, 1, 0, 0, 1, 0, 1, 1, // Top face    
      1, 1, 0, 1, 0, 0, 1, 0, // Bottom face   
      1, 0, 1, 1, 0, 1, 0, 0, // Right face    
      0, 0, 1, 0, 1, 1, 0, 1 // Left face
    ]),
    index: gl_createElementArrayBuffer([
      0, 1, 2, 0, 2, 3, // Front face
      4, 5, 6, 4, 6, 7, // Back face
      8, 9, 10, 8, 10, 11, // Top face
      12, 13, 14, 12, 14, 15, // Bottom face
      16, 17, 18, 16, 18, 19, // Right face
      20, 21, 22, 20, 22, 23 // Left face
    ])
  },
  plane: {
    position: gl_createArrayBuffer([
      -50, 0, -50, -50, 0, 50, 50, 0, 50, 50, 0, -50
    ]),
    normal: gl_createArrayBuffer([
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
    ]),
    texture: gl_createArrayBuffer([
      0, 25, 0, 0, 25, 0, 25, 25
    ]),
    index: gl_createElementArrayBuffer([
      0, 1, 2, 0, 2, 3
    ])
  },
  // wall: {
  //   position: gl_createArrayBuffer([
  //     -50, 5, 0, 50, 5, 0, 50, -5, 0, -50, -5, 0
  //   ]),
  //   normal: gl_createArrayBuffer([
  //     0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
  //   ]),
  //   texture: gl_createArrayBuffer([
  //     0, 0, 25, 0, 25, 1.5, 0, 1.5
  //   ]),
  //   index: gl_createElementArrayBuffer([
  //     0, 1, 2, 0, 2, 3
  //   ])
  // }
}