            /*************************************
             * Controller
             */
            function Controller(){
                this.view = new View(this);
                this.gl = new WebGL("myCanvas");
                this.gl.setShaderProgram("TEXTURE_DIRECTIONAL_LIGHTING");
                this.model = new Model(this);
                
                this.attachListeners();
                
                var sources = {
                    crate: '{{GROUND_TEXTURE_ENCODING}}',
                    metalFloor: '{{GROUND_TEXTURE_ENCODING}}',
                    metalWall: '{{GROUND_TEXTURE_ENCODING}}',
                    ceiling: '{{GROUND_TEXTURE_ENCODING}}'
                };
                
                this.mouseDownPos = null;
                this.mouseDownPitch = 0;
                this.mouseDownYaw = 0;
                
                var that = this;
                this.loadTextures(sources, function(){
                    that.gl.setStage(function(){
                        that.view.stage();
                    });
                    
                    that.gl.startAnimation();
                });
            }
            
            Controller.prototype.loadTextures = function(sources, callback){
                var gl = this.gl;
                var context = gl.getContext();
                var textures = this.model.textures;
                var loadedImages = 0;
                var numImages = 0;
                for (var src in sources) {
                    // anonymous function to induce scope
                    (function(){
                        var key = src;
                        numImages++;
                        textures[key] = context.createTexture();
                        textures[key].image = new Image();
                        textures[key].image.onload = function(){
                            gl.initTexture(textures[key]);
                            if (++loadedImages >= numImages) {
                                callback();
                            }
                        };
                        
                        textures[key].image.src = sources[key];
                    })();
                }
            };
            
            Controller.prototype.getMousePos = function(evt){
                return {
                    x: evt.clientX,
                    y: evt.clientY
                };
            };
            
            Controller.prototype.handleMouseDown = function(evt){
                var camera = this.model.camera;
                this.mouseDownPos = this.getMousePos(evt);
                this.mouseDownPitch = camera.pitch;
                this.mouseDownYaw = camera.yaw;
            };
            
            Controller.prototype.handleMouseMove = function(evt){
                var mouseDownPos = this.mouseDownPos;
                var gl = this.gl;
                if (mouseDownPos !== null) {
                    var mousePos = this.getMousePos(evt);
                    
                    // update pitch
                    var yDiff = mousePos.y - mouseDownPos.y;
                    this.model.camera.pitch = this.mouseDownPitch + yDiff / gl.getCanvas().height;
                    
                    // update yaw
                    var xDiff = mousePos.x - mouseDownPos.x;
                    this.model.camera.yaw = this.mouseDownYaw + xDiff / gl.getCanvas().width;
                }
            };
            
            Controller.prototype.handleKeyDown = function(evt){
                var keycode = ((evt.which) || (evt.keyCode));
                var model = this.model;
                switch (keycode) {
                    case 37:
                        // left key
                        model.sideMovement = model.LEFT;
                        break;
                    case 38:
                        // up key
                        model.straightMovement = model.FORWARD;
                        break;
                    case 39:
                        // right key
                        model.sideMovement = model.RIGHT;
                        break;
                    case 40:
                        // down key
                        model.straightMovement = model.BACKWARD;
                        break;
                }
            };
            
            Controller.prototype.handleKeyUp = function(evt){
                var keycode = ((evt.which) || (evt.keyCode));
                var model = this.model;
                switch (keycode) {
                    case 37:
                        // left key
                        model.sideMovement = model.STILL;
                        break;
                    case 38:
                        // up key
                        model.straightMovement = model.STILL;
                        break;
                    case 39:
                        // right key
                        model.sideMovement = model.STILL;
                        break;
                    case 40:
                        // down key
                        model.straightMovement = model.STILL;
                        break;
                }
            };
            
            Controller.prototype.attachListeners = function(){
                var gl = this.gl;
                var that = this;
                gl.getCanvas().addEventListener("mousedown", function(evt){
                    that.handleMouseDown(evt);
                }, false);
                
                gl.getCanvas().addEventListener("mousemove", function(evt){
                    that.handleMouseMove(evt);
                }, false);
                
                document.addEventListener("mouseup", function(evt){
                    that.mouseDownPos = null;
                }, false);
                
                document.addEventListener("mouseout", function(evt){
                    // same as mouseup functionality
                    that.mouseDownPos = null;
                }, false);
                
                document.addEventListener("keydown", function(evt){
                    that.handleKeyDown(evt);
                }, false);
                
                document.addEventListener("keyup", function(evt){
                    that.handleKeyUp(evt);
                }, false);
            };
            
            /*************************************
             * Model
             */
            function Model(controller){
                this.controller = controller;
                this.cubeBuffers = {};
                this.floorBuffers = {};
                this.wallBuffers = {};
                this.angle = 0;
                this.textures = {};
                this.cratePositions = [];
                
                // movements
                this.STILL = "STILL";
                this.FORWARD = "FORWARD";
                this.BACKWARD = "BACKWARD";
                this.LEFT = "LEFT";
                this.RIGHT = "RIGHT";
                
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
            
            Model.prototype.initCratePositions = function(){
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
            
            Model.prototype.initCubeBuffers = function(){
                var gl = this.controller.gl;
                this.cubeBuffers.positionBuffer = gl.createArrayBuffer([    
                  -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, // Front face    
                  -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, // Back face    
                  -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1, // Top face    
                  -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, // Bottom face    
                  1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, // Right face    
                  -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1 // Left face
        ]);
                
                this.cubeBuffers.normalBuffer = gl.createArrayBuffer([    
                  0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // Front face    
                  0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // Back face   
                  0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // Top face    
                  0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // Bottom face    
                  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // Right face    
                  -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 // Left face
        ]);
                
                this.cubeBuffers.textureBuffer = gl.createArrayBuffer([    
                  0, 0, 1, 0, 1, 1, 0, 1, // Front face   
                  1, 0, 1, 1, 0, 1, 0, 0, // Back face   
                  0, 1, 0, 0, 1, 0, 1, 1, // Top face    
                  1, 1, 0, 1, 0, 0, 1, 0, // Bottom face   
                  1, 0, 1, 1, 0, 1, 0, 0, // Right face    
                  0, 0, 1, 0, 1, 1, 0, 1 // Left face
        ]);
                
                this.cubeBuffers.indexBuffer = gl.createElementArrayBuffer([
          0, 1, 2, 0, 2, 3, // Front face
                4, 5, 6, 4, 6, 7, // Back face
                8, 9, 10, 8, 10, 11, // Top face
                12, 13, 14, 12, 14, 15, // Bottom face
                16, 17, 18, 16, 18, 19, // Right face
                20, 21, 22, 20, 22, 23 // Left face
              ]);
            };
            
            Model.prototype.initFloorBuffers = function(){
                var gl = this.controller.gl;
                this.floorBuffers.positionBuffer = gl.createArrayBuffer([
          -50, 0, -50, -50, 0, 50, 50, 0, 50, 50, 0, -50
        ]);
                
                this.floorBuffers.textureBuffer = gl.createArrayBuffer([
          0, 25, 0, 0, 25, 0, 25, 25
        ]);
                
                this.floorBuffers.indexBuffer = gl.createElementArrayBuffer([
          0, 1, 2, 0, 2, 3
        ]);
                
                // floor normal points upwards
                this.floorBuffers.normalBuffer = gl.createArrayBuffer([
          0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
        ]);
            };
            
            Model.prototype.initWallBuffers = function(){
                var gl = this.controller.gl;
                this.wallBuffers.positionBuffer = gl.createArrayBuffer([
          -50, 5, 0, 50, 5, 0, 50, -5, 0, -50, -5, 0
        ]);
                
                this.wallBuffers.textureBuffer = gl.createArrayBuffer([
          0, 0, 25, 0, 25, 1.5, 0, 1.5
        ]);
                
                this.wallBuffers.indexBuffer = gl.createElementArrayBuffer([
          0, 1, 2, 0, 2, 3
        ]);
                
                // floor normal points upwards
                this.wallBuffers.normalBuffer = gl.createArrayBuffer([
          0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
        ]);
            };
            
            Model.prototype.initBuffers = function(){
                this.initCubeBuffers();
                this.initFloorBuffers();
                this.initWallBuffers();
            };
            
            Model.prototype.updateCameraPos = function(){
                var gl = this.controller.gl;
                if (this.straightMovement != this.STILL) {
                    var direction = this.straightMovement == this.FORWARD ? -1 : 1;
                    var distEachFrame = direction * this.speed * gl.getTimeInterval() / 1000;
                    this.camera.z += distEachFrame * Math.cos(this.camera.yaw);
                    this.camera.x += distEachFrame * Math.sin(this.camera.yaw);
                }
                
                if (this.sideMovement != this.STILL) {
                    var direction = this.sideMovement == this.RIGHT ? 1 : -1;
                    var distEachFrame = direction * this.speed * gl.getTimeInterval() / 1000;
                    this.camera.z += distEachFrame * Math.cos(this.camera.yaw + Math.PI / 2);
                    this.camera.x += distEachFrame * Math.sin(this.camera.yaw + Math.PI / 2);
                }
            };
            
            /*************************************
             * View
             */
            function View(controller){
                this.controller = controller;
                this.canvas = document.getElementById("myCanvas");
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
            
            View.prototype.drawFloor = function(){
                var controller = this.controller;
                var gl = controller.gl;
                var model = controller.model;
                var floorBuffers = model.floorBuffers;
                
                gl.save();
                gl.translate(0, -1.1, 0);
                gl.pushPositionBuffer(floorBuffers);
                gl.pushNormalBuffer(floorBuffers);
                gl.pushTextureBuffer(floorBuffers, model.textures.metalFloor);
                gl.pushIndexBuffer(floorBuffers);
                gl.drawElements(floorBuffers);
                gl.restore();
            };
            
            View.prototype.drawCeiling = function(){
                var controller = this.controller;
                var gl = controller.gl;
                var model = controller.model;
                var floorBuffers = model.floorBuffers;
                
                gl.save();
                gl.translate(0, 8.9, 0);
                // use floor buffers with ceiling texture
                gl.pushPositionBuffer(floorBuffers);
                gl.pushNormalBuffer(floorBuffers);
                gl.pushTextureBuffer(floorBuffers, model.textures.ceiling);
                gl.pushIndexBuffer(floorBuffers);
                gl.drawElements(floorBuffers);
                gl.restore();
            };
            
            View.prototype.drawCrates = function(){
                var controller = this.controller;
                var gl = controller.gl;
                var model = controller.model;
                var cubeBuffers = model.cubeBuffers;
                
                for (var n = 0; n < model.cratePositions.length; n++) {
                    gl.save();
                    var cratePos = model.cratePositions[n];
                    gl.translate(cratePos.x, cratePos.y, cratePos.z);
                    gl.rotate(cratePos.rotationY, 0, 1, 0);
                    gl.pushPositionBuffer(cubeBuffers);
                    gl.pushNormalBuffer(cubeBuffers);
                    gl.pushTextureBuffer(cubeBuffers, model.textures.crate);
                    gl.pushIndexBuffer(cubeBuffers);
                    gl.drawElements(cubeBuffers);
                    gl.restore();
                }
            };
            
            View.prototype.drawWalls = function(){
                var controller = this.controller;
                var gl = controller.gl;
                var model = controller.model;
                var wallBuffers = model.wallBuffers;
                var metalWallTexture = model.textures.metalWall;
                
                gl.save();
                gl.translate(0, 3.9, -50);
                gl.pushPositionBuffer(wallBuffers);
                gl.pushNormalBuffer(wallBuffers);
                gl.pushTextureBuffer(wallBuffers, metalWallTexture);
                gl.pushIndexBuffer(wallBuffers);
                gl.drawElements(wallBuffers);
                gl.restore();
                
                gl.save();
                gl.translate(0, 3.9, 50);
                gl.rotate(Math.PI, 0, 1, 0);
                gl.pushPositionBuffer(wallBuffers);
                gl.pushNormalBuffer(wallBuffers);
                gl.pushTextureBuffer(wallBuffers, metalWallTexture);
                gl.pushIndexBuffer(wallBuffers);
                gl.drawElements(wallBuffers);
                gl.restore();
                
                gl.save();
                gl.translate(50, 3.9, 0);
                gl.rotate(Math.PI * 1.5, 0, 1, 0);
                gl.pushPositionBuffer(wallBuffers);
                gl.pushNormalBuffer(wallBuffers);
                gl.pushTextureBuffer(wallBuffers, metalWallTexture);
                gl.pushIndexBuffer(wallBuffers);
                gl.drawElements(wallBuffers);
                gl.restore();
                
                gl.save();
                gl.translate(-50, 3.9, 0);
                gl.rotate(Math.PI / 2, 0, 1, 0);
                gl.pushPositionBuffer(wallBuffers);
                gl.pushNormalBuffer(wallBuffers);
                gl.pushTextureBuffer(wallBuffers, metalWallTexture);
                gl.pushIndexBuffer(wallBuffers);
                gl.drawElements(wallBuffers);
                gl.restore();
            };
            
            View.prototype.stage = function(){
                var controller = this.controller;
                var gl = controller.gl;
                var model = controller.model;
                var view = controller.view;
                var camera = model.camera;
                model.updateCameraPos();
        
                gl.clear();
        
                // set field of view at 45 degrees
                // set viewing range between 0.1 and 100 units away.
                gl.perspective(45, 0.1, 150.0);
                gl.identity();
                
                gl.rotate(-camera.pitch, 1, 0, 0);
                gl.rotate(-camera.yaw, 0, 1, 0);
                gl.translate(-camera.x, -camera.y, -camera.z);
                
                // enable lighting
                gl.enableLighting();
                gl.setAmbientLighting(0.5, 0.5, 0.5);
                gl.setDirectionalLighting(-0.25, -0.25, -1, 0.8, 0.8, 0.8);
                
                view.drawFloor();
                view.drawWalls();
                view.drawCeiling();
                view.drawCrates();
            };
            
            window.onload = function(){
                new Controller();
            };