            /*************************************
             * View
             */
            function View(){
                this.canvas = document.getElementById('scene');
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
            
            View.prototype.drawFloor = function(){
                var floorBuffers = model.floorBuffers;
                
                gl_save();
                gl_translate(0, -1.1, 0);
                gl_pushPositionBuffer(floorBuffers);
                gl_pushNormalBuffer(floorBuffers);
                gl_pushTextureBuffer(floorBuffers, model.textures.metalFloor);
                gl_pushIndexBuffer(floorBuffers);
                gl_drawElements(floorBuffers);
                gl_restore();
            };
            
            View.prototype.drawCeiling = function(){
                var floorBuffers = model.floorBuffers;
                
                gl_save();
                gl_translate(0, 8.9, 0);
                // use floor buffers with ceiling texture
                gl_pushPositionBuffer(floorBuffers);
                gl_pushNormalBuffer(floorBuffers);
                gl_pushTextureBuffer(floorBuffers, model.textures.ceiling);
                gl_pushIndexBuffer(floorBuffers);
                gl_drawElements(floorBuffers);
                gl_restore();
            };
            
            View.prototype.drawCrates = function(){
                var cubeBuffers = model.cubeBuffers;
                
                for (var n = 0; n < model.cratePositions.length; n++) {
                    gl_save();
                    var cratePos = model.cratePositions[n];
                    gl_translate(cratePos.x, cratePos.y, cratePos.z);
                    gl_rotate(cratePos.rotationY, 0, 1, 0);
                    gl_pushPositionBuffer(cubeBuffers);
                    gl_pushNormalBuffer(cubeBuffers);
                    gl_pushTextureBuffer(cubeBuffers, model.textures.crate);
                    gl_pushIndexBuffer(cubeBuffers);
                    gl_drawElements(cubeBuffers);
                    gl_restore();
                }
            };
            
            View.prototype.drawWalls = function(){
                var wallBuffers = model.wallBuffers;
                var metalWallTexture = model.textures.metalWall;
                
                gl_save();
                gl_translate(0, 3.9, -50);
                gl_pushPositionBuffer(wallBuffers);
                gl_pushNormalBuffer(wallBuffers);
                gl_pushTextureBuffer(wallBuffers, metalWallTexture);
                gl_pushIndexBuffer(wallBuffers);
                gl_drawElements(wallBuffers);
                gl_restore();
                
                gl_save();
                gl_translate(0, 3.9, 50);
                gl_rotate(Math.PI, 0, 1, 0);
                gl_pushPositionBuffer(wallBuffers);
                gl_pushNormalBuffer(wallBuffers);
                gl_pushTextureBuffer(wallBuffers, metalWallTexture);
                gl_pushIndexBuffer(wallBuffers);
                gl_drawElements(wallBuffers);
                gl_restore();
                
                gl_save();
                gl_translate(50, 3.9, 0);
                gl_rotate(Math.PI * 1.5, 0, 1, 0);
                gl_pushPositionBuffer(wallBuffers);
                gl_pushNormalBuffer(wallBuffers);
                gl_pushTextureBuffer(wallBuffers, metalWallTexture);
                gl_pushIndexBuffer(wallBuffers);
                gl_drawElements(wallBuffers);
                gl_restore();
                
                gl_save();
                gl_translate(-50, 3.9, 0);
                gl_rotate(Math.PI / 2, 0, 1, 0);
                gl_pushPositionBuffer(wallBuffers);
                gl_pushNormalBuffer(wallBuffers);
                gl_pushTextureBuffer(wallBuffers, metalWallTexture);
                gl_pushIndexBuffer(wallBuffers);
                gl_drawElements(wallBuffers);
                gl_restore();
            };
            
            View.prototype.stage = function(){
                var camera = model.camera;
                model.updateCameraPos();
        
                gl_clear();
        
                // set field of view at 45 degrees
                // set viewing range between 0.1 and 100 units away.
                gl_perspective(45, 0.1, 150.0);
                gl_identity();
                
                gl_rotate(-camera.pitch, 1, 0, 0);
                gl_rotate(-camera.yaw, 0, 1, 0);
                gl_translate(-camera.x, -camera.y, -camera.z);
                
                // enable lighting
                gl_enableLighting();
                gl_setAmbientLighting(0.5, 0.5, 0.5);
                gl_setDirectionalLighting(-0.25, -0.25, -1, 0.8, 0.8, 0.8);
                
                view.drawFloor();
                view.drawWalls();
                view.drawCeiling();
                view.drawCrates();
            };