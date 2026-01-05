# The Underground Rubik's Cube

A 3D interactive Rubik’s Cube built with A-Frame and Three.js, where **each side of the cube is not made of simple colors but music albums**.
Users can rotate rows, columns, and faces of the cube just like a real Rubik’s Cube, inside an immersive 3D environment.

https://johnnys1611.github.io/CUBE/

The cube is 3×3×3
Each small cubelet is a glTF model
Instead of classic colors, each face displays music album covers
The entire experience takes place in an underground tunnel environment

A-Frame 1.7.0 – WebVR / 3D scene rendering
Three.js – group rotations & transformation math
HTML / CSS / JavaScript
glTF (.glb) models
GitHub Pages (optional for hosting)

Each move is defined inside `sliceDefs`
A temporary `THREE.Group` is created
The cubelets of the selected slice are added to the group
Rotation is animated over **25 frames**
Transformations are **baked** into the cubelets
Positions are rounded to avoid floating-point errors
`moveHistory` stores moves for the Undo feature
