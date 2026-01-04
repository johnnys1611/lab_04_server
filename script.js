let isRotating = false; // flag για το κλείδωμα στα clicks

let moveHistory = []; // καβάτζα για το undo

const positions = [-1, 0, 1]; // x συντεταγμένες των στηλών του κύβου
// ο κύβος είναι 3x3x3 οι θέσεις είναι αριστερά (-1), κέντρο (0), δεξιά (1)

const layersY = [1, 2, 3]; // τα επίπεδα καθ' ύψος κατά πάνω απόσταση στα κυβάκια
// y=1 κάτω, y=2 μεσαίο, y=3 πάνω

const layersZ = [-2, -3, -4]; // κατά z μπρος πίσω
const cubeSize = 0.47;  // η απόσταση στα κυβάκια, το μέγεθος τους βασικά
const model = '#cube-model';

// slices definitions, with their centers and match functions
const sliceDefs = {
  // γραμμές
  // αριστερά 90
  Tl:  {center: [0,3,-3],  match: (x,y,z) => y===3, axis: 'y', angle: 90},      // Top row πρώτη γραμμή
  // δεξιά -90
  Tr:  {center: [0,3,-3],  match: (x,y,z) => y===3, axis: 'y', angle: -90},
  // το κεντρικό σημείο γύρω από το οποίο θα περιστρέφεται η φέτα

  // δεξιά -90
  Dr:  {center: [0,1,-3],  match: (x,y,z) => y===1, axis: 'y', angle: -90},     // Bottom row τελευταία γραμμή
  // αριστερά 90
  Dl:  {center: [0,1,-3],  match: (x,y,z) => y===1, axis: 'y', angle: 90},

  // αριστερά 90
  Ml:  {center: [0,2,-3],  match: (x,y,z) => y===2, axis: 'y', angle: 90},
  // δεξιά -90
  Mr:  {center: [0,2,-3],  match: (x,y,z) => y===2, axis: 'y', angle: -90},


  // στήλες
  // προς τα πάνω πάει η στήλη η πρώτη -90
  Lu:  {center: [-1,2,-3], match: (x,y,z) => x===-1, axis: 'x', angle: -90},    // Left column
  // προς τα κάτω πάει η στήλη η πρώτη 90
  Ld:  {center: [-1,2,-3], match: (x,y,z) => x===-1, axis: 'x', angle: 90},

  // προς τα κάτω πάει η στήλη η τρίτη δεξιά 90
  Rd:  {center: [1,2,-3],  match: (x,y,z) => x===1, axis: 'x', angle: 90},      // Right column
  // προς τα πάνω πάει η στήλη η τρίτη δεξιά -90
  Ru:  {center: [1,2,-3],  match: (x,y,z) => x===1, axis: 'x', angle: -90},
  
  // προς τα πάνω πάει η στήλη η δεύτερη κέντρο -90
  Mu:  {center: [0,2,-3],  match: (x,y,z) => x===0, axis: 'x', angle: -90},
  // προς τα κάτω πάει η στήλη η δεύτερη κέντρο 90
  Md:  {center: [0,2,-3],  match: (x,y,z) => x===0, axis: 'x', angle: 90},


  // faces
  // προς τα αριστερά το μπροστά face 90
  FFl:  {center: [0,2,-2],  match: (x,y,z) => z===-2, axis: 'z', angle: 90},     // Front slice
  // προς τα δεξιά το μπροστά face -90
  FFr:  {center: [0,2,-2],  match: (x,y,z) => z===-2, axis: 'z', angle: -90},
  
  // προς τα αριστερά το πίσω face 90
  BFl:  {center: [0,2,-4],  match: (x,y,z) => z===-4, axis: 'z', angle: 90},
  // προς τα δεξιά το πίσω face -90
  BFr:  {center: [0,2,-4],  match: (x,y,z) => z===-4, axis: 'z', angle: -90},    // Back slice

  // προς τα αριστερά το μεσαίο face 90
  MFl:  {center: [0,2,-3],  match: (x,y,z) => z===-3, axis: 'z', angle: 90},
  // προς τα δεξιά το μεσαίο face -90
  MFr:  {center: [0,2,-3],  match: (x,y,z) => z===-3, axis: 'z', angle: -90}
};

// create all cubelets under cube-cluster, no duplicates
const cluster = document.getElementById('cube-cluster');
let cubelets = []; // στον πίνακα θα αποθηκευτούν όλα τα cubelets που θα δημιουργηθούν
for (x of positions) {
  for (let y of layersY) {
    for (let z of layersZ) {
      let cubelet = document.createElement('a-entity'); // δημιουργεί ένα νέο A-Frame entity κύβο
      cubelet.setAttribute('gltf-model', model); // βάζει το glTF μοντέλο που θα χρησιμοποιήσει ο κάθε κύβος
      cubelet.setAttribute('position', `${x} ${y} ${z}`); //ορίζει τη 3D θέση του cubelet στο χώρο (X, Y, Z)
      cubelet.setAttribute('scale', `${cubeSize} ${cubeSize} ${cubeSize}`); // ορίζει το μέγεθος (scale) του cubelet σε όλες τις διαστάσεις ίσο με cubeSize
      cubelet.setAttribute('rotation', `0 0 0`); // βάζει προεπιλεγμένη περιστροφή (κανένα rotation)
      cubelet.setAttribute('data-x', x);
      cubelet.setAttribute('data-y', y);
      cubelet.setAttribute('data-z', z);
      cluster.appendChild(cubelet); // προσθέτει το cubelet μέσα στο cluster, άρα εμφανίζεται στη σκηνή
      cubelets.push(cubelet); // το κρατάει και στην λίστα cubelets
    }
  }
}

// μια συνάρτηση με παράμετρο rot.
function parseRotation(rot) {
  if (typeof rot === 'string') { // τσεκάρει αν το rot είναι string
    // πχ. "0 45 90"

    // 1. rot.trim() → αφαιρεί κενά στην αρχή/τέλος
    // 2. .split(/\s+/) → σπάει το string όπου βρει ένα ή περισσότερα κενά "30 0 90" → ["30","0","90"]
    // 3. .map(Number) → μετατρέπει κάθε στοιχείο σε αριθμό ["30","0","90"] → [30, 0, 90]
    let arr = rot.trim().split(/\s+/).map(Number);
    return {x: arr[0]||0, y: arr[1]||0, z: arr[2]||0};
  }
  return rot || {x:0, y:0, z:0};
}

// rotate slice animation
function rotateSlice(face, isUndo = false) {
  if (isRotating) return; // αν ήδη γίνεται περιστροφή να μην ξεκινήσει άλλη
  isRotating = true;

  const sliceDef = sliceDefs[face];
  if (!sliceDef) {
    isRotating = false;
    return;
  }

  // match: συνάρτηση που λέει ποια cubelets ανήκουν στο slice
  // axis: άξονας περιστροφής (x, y, z)
  // angle: συνολική γωνία περιστροφής (μοίρες)
  // center: κέντρο περιστροφής
  const { match, axis, angle, center } = sliceDef;

  // δημιουργία προσωρινής φέτας για να τα περιστρέψουμε όλα μαζί
  const group = new THREE.Group();
  group.position.set(center[0], center[1], center[2]);
  cluster.object3D.add(group);

  // ποια κυβάκια ανήκουν στην φέτα
  const affected = cubelets.filter(cubelet => {
    const x = +cubelet.getAttribute('data-x');
    const y = +cubelet.getAttribute('data-y');
    const z = +cubelet.getAttribute('data-z');

    // επιστρέφει true αν το κυβάκι ανήκει στη φέτα
    return match(x, y, z);
  });


  // μεταφέρουμε τα cubelets στη φέτα
  // αφαιρούμε πρώτα τη θέση του κέντρου ώστε να περιστρέφονται σωστά 
  affected.forEach(cubelet => {
    const obj = cubelet.object3D;
    obj.position.sub(group.position);
    group.add(obj);
  });

  // animation params
  const totalAngle = THREE.MathUtils.degToRad(angle);
  const step = totalAngle / 25; // frames
  let rotated = 0; // πόσο έχει περιστραφεί μέχρι στιγμής

  // animation loop
  function animate() {
    // αν φτάσαμε ή περάσαμε τη συνολική γωνία σταματάμε
    if (Math.abs(rotated) >= Math.abs(totalAngle)) {
      finish();
      return;
    }

    // εφαρμογή περιστροφής
    if (axis === 'x') group.rotation.x += step;
    if (axis === 'y') group.rotation.y -= step;
    if (axis === 'z') group.rotation.z += step;

    rotated += step;
    requestAnimationFrame(animate);
  }

  function finish() {
    // ενημερώνουμε τους μετασχηματισμούς της φέτας
    group.updateMatrixWorld(true);

    affected.forEach(cubelet => {
      const obj = cubelet.object3D;

      // bake transform
      obj.applyMatrix4(group.matrix);
      obj.updateMatrixWorld(true);

      // το ξαναβάζουμε πίσω στο βασικό cluster
      cluster.object3D.add(obj);

      // στρογγυλοποίηση θέσης για αποφυγή σφαλμάτων
      const p = obj.position;
      cubelet.setAttribute('position', {
        x: Math.round(p.x),
        y: Math.round(p.y),
        z: Math.round(p.z)
      });

      // ενημέρωση των data
      cubelet.setAttribute('data-x', Math.round(p.x));
      cubelet.setAttribute('data-y', Math.round(p.y));
      cubelet.setAttribute('data-z', Math.round(p.z));
    });

    // αφαιρούμε την προσωρινή φέτα
    cluster.object3D.remove(group);

    // ξανά επιτρέπουμε το κλικ
    isRotating = false;

    // αν δεν είναι undo το αποθηκεύουμε στο moveHistory
    if (!isUndo) moveHistory.push(face);
  }
  animate();
}

function undoMove() {
  if (isRotating) return;

  // αν δεν υπάρχει ιστορικό δεν κάνουμε τίποτα
  if (moveHistory.length === 0) return;

  // παίρνουμε την τελευταία κίνηση
  const lastMove = moveHistory.pop();

  // βρίσκουμε την αντίθετη κίνηση
  const inverseMoves = {
    Tl: 'Tr', Tr: 'Tl', Dl: 'Dr', Dr: 'Dl',
    Ml: 'Mr', Mr: 'Ml', Lu: 'Ld', Ld: 'Lu',
    Ru: 'Rd', Rd: 'Ru', Mu: 'Md', Md: 'Mu',
    FFl: 'FFr', FFr: 'FFl', BFl: 'BFr', BFr: 'BFl',
    MFl: 'MFr', MFr: 'MFl'
  };

  const inverse = inverseMoves[lastMove];
  if (!inverse) return;

  // call rotateSlice with the inverse move
  rotateSlice(inverse, true); // true σημαίνει undo

}

window.rotateSlice = rotateSlice;

