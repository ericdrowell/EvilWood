            /*************************************
             * Model
             */
            function Model() {
                this.cubeBuffers = {};
                this.floorBuffers = {};
                this.wallBuffers = {};
                this.angle = 0;
                this.textures = {};
                this.cratePositions = [];
                
                // movements
                this.STILL = 'STILL';
                this.FORWARD = 'FORWARD';
                this.BACKWARD = 'BACKWARD';
                this.LEFT = 'LEFT';
                this.RIGHT = 'RIGHT';
                
                // camera
                this.camera = {
                    x: 0,
                    y: 1.5,
                    z: 5,
                    pitch: 0,
                    yaw: 0
                };
                
                this.straightMovement = this.STILL;
                this.sideMovement = this.STILL;
                this.speed = 8; // units per second 
                this.initBuffers();
                this.initCratePositions();
            }
            
            Model.prototype.initCratePositions = function() {
                var crateRange = 45;
                // randomize 20 floor crates
                for (var n = 0; n < 20; n++) {
                    var cratePos = {};
                    cratePos.x = (Math.random() * crateRange * 2) - crateRange;
                    cratePos.y = 0;
                    cratePos.z = (Math.random() * crateRange * 2) - crateRange;
                    cratePos.rotationY = Math.random() * Math.PI * 2;
                    this.cratePositions.push(cratePos);
                    
                    if (Math.round(Math.random() * 3) == 3) {
                        var stackedCratePosition = {};
                        stackedCratePosition.x = cratePos.x;
                        stackedCratePosition.y = 2.01;
                        stackedCratePosition.z = cratePos.z;
                        stackedCratePosition.rotationY = cratePos.rotationY + ((Math.random() * Math.PI / 8) - Math.PI / 16);
                        this.cratePositions.push(stackedCratePosition);
                    }
                }
            };
            
            Model.prototype.initCubeBuffers = function() {
                this.cubeBuffers.positionBuffer = gl_createArrayBuffer([    
                  -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, // Front face    
                  -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, // Back face    
                  -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1, // Top face    
                  -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, // Bottom face    
                  1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, // Right face    
                  -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1 // Left face
        ]);
                
                this.cubeBuffers.normalBuffer = gl_createArrayBuffer([    
                  0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // Front face    
                  0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // Back face   
                  0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // Top face    
                  0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // Bottom face    
                  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // Right face    
                  -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 // Left face
        ]);
                
                this.cubeBuffers.textureBuffer = gl_createArrayBuffer([    
                  0, 0, 1, 0, 1, 1, 0, 1, // Front face   
                  1, 0, 1, 1, 0, 1, 0, 0, // Back face   
                  0, 1, 0, 0, 1, 0, 1, 1, // Top face    
                  1, 1, 0, 1, 0, 0, 1, 0, // Bottom face   
                  1, 0, 1, 1, 0, 1, 0, 0, // Right face    
                  0, 0, 1, 0, 1, 1, 0, 1 // Left face
        ]);
                
                this.cubeBuffers.indexBuffer = gl_createElementArrayBuffer([
          0, 1, 2, 0, 2, 3, // Front face
                4, 5, 6, 4, 6, 7, // Back face
                8, 9, 10, 8, 10, 11, // Top face
                12, 13, 14, 12, 14, 15, // Bottom face
                16, 17, 18, 16, 18, 19, // Right face
                20, 21, 22, 20, 22, 23 // Left face
              ]);
            };
            
            Model.prototype.initFloorBuffers = function() {
                this.floorBuffers.positionBuffer = gl_createArrayBuffer([
          -50, 0, -50, -50, 0, 50, 50, 0, 50, 50, 0, -50
        ]);
                
                this.floorBuffers.textureBuffer = gl_createArrayBuffer([
          0, 25, 0, 0, 25, 0, 25, 25
        ]);
                
                this.floorBuffers.indexBuffer = gl_createElementArrayBuffer([
          0, 1, 2, 0, 2, 3
        ]);
                
                // floor normal points upwards
                this.floorBuffers.normalBuffer = gl_createArrayBuffer([
          0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
        ]);
            };
            
            Model.prototype.initWallBuffers = function() {
                this.wallBuffers.positionBuffer = gl_createArrayBuffer([
          -50, 5, 0, 50, 5, 0, 50, -5, 0, -50, -5, 0
        ]);
                
                this.wallBuffers.textureBuffer = gl_createArrayBuffer([
          0, 0, 25, 0, 25, 1.5, 0, 1.5
        ]);
                
                this.wallBuffers.indexBuffer = gl_createElementArrayBuffer([
          0, 1, 2, 0, 2, 3
        ]);
                
                // floor normal points upwards
                this.wallBuffers.normalBuffer = gl_createArrayBuffer([
          0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
        ]);
            };
            
            Model.prototype.initBuffers = function() {
                this.initCubeBuffers();
                this.initFloorBuffers();
                this.initWallBuffers();
            };
            
            Model.prototype.updateCameraPos = function() {
                if (this.straightMovement != this.STILL) {
                    var direction = this.straightMovement == this.FORWARD ? -1 : 1;
                    var distEachFrame = direction * this.speed * 0 / 1000;
                    this.camera.z += distEachFrame * Math.cos(this.camera.yaw);
                    this.camera.x += distEachFrame * Math.sin(this.camera.yaw);
                }
                
                if (this.sideMovement != this.STILL) {
                    var direction = this.sideMovement == this.RIGHT ? 1 : -1;
                    var distEachFrame = direction * this.speed * 0 / 1000;
                    this.camera.z += distEachFrame * Math.cos(this.camera.yaw + Math.PI / 2);
                    this.camera.x += distEachFrame * Math.sin(this.camera.yaw + Math.PI / 2);
                }
            };