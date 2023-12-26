import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, Mesh, MeshBuilder, Quaternion } from 'babylonjs';
import 'babylonjs-loaders';


const canvas = document.getElementById("canvas") as HTMLCanvasElement;
if (!canvas) throw new Error("Couldn't find a canvas. Aborting the demo");

const engine = new Engine(canvas, true);
const scene = new Scene(engine);

function prepareScene(): void {
    const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 4, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    new HemisphericLight("light", new Vector3(0.2, 0.5, 0.8).normalize(), scene);

    const plane = MeshBuilder.CreateBox("Plane", {}, scene);
    plane.rotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI, 0);

    const icosphere = MeshBuilder.CreateIcoSphere("IcoSphere", {}, scene);
    icosphere.position.set(-2, 0, 0);

    const cylinder = MeshBuilder.CreateCylinder("Cylinder", {}, scene);
    cylinder.position.set(2, 0, 0);
}


scene.onPointerObservable.add((pointerInfo) => {
	if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
		const mesh = pointerInfo.pickInfo?.pickedMesh as Mesh; // Cast 'AbstractMesh' to 'Mesh'
		if (mesh) {
			showUIForMesh(mesh);
		}
	}
});

function showUIForMesh(mesh: Mesh): void {
	hideCurrentUI();

	switch (mesh.name) {
		case "Plane":
			showCubeUI(mesh);
			break;
		case "IcoSphere":
			showIcoSphereUI(mesh);
			break;
		case "Cylinder":
			showCylinderUI(mesh);
			break;
	}
}

function showCylinderUI(mesh: Mesh): void {
    const ui = document.getElementById('ui-container');
    if (ui) {
        ui.innerHTML = `
            <label>Radius: <input type="range" id="cylinder-radius" min="0.1" max="2.0" step="0.1" value="${mesh.scaling.x}"></label>
            <label>Height: <input type="range" id="cylinder-height" min="0.1" max="2.0" step="0.1" value="${mesh.scaling.y}"></label>
        `;
        ui.style.display = 'block';

        document.getElementById('cylinder-radius')?.addEventListener('input', (event) => {
            updateCylinderSize('radius', (event.target as HTMLInputElement).value, mesh.name);
        });
        
        document.getElementById('cylinder-height')?.addEventListener('input', (event) => {
            updateCylinderSize('height', (event.target as HTMLInputElement).value, mesh.name);
        });
    }
}

function updateCylinderSize(dimension: string, value: string, meshName: string): void {
    const mesh = scene.getMeshByName(meshName);
    const numValue = parseFloat(value);
    if (mesh) {
        switch (dimension) {
            case 'radius':
                mesh.scaling.x = numValue;
                mesh.scaling.z = numValue;
                break;
            case 'height':
                mesh.scaling.y = numValue;
                break;
        }
    }
}


function showIcoSphereUI(mesh: Mesh): void {
	const ui = document.getElementById('ui-container');

	if (ui) {
		ui.innerHTML = `
			<label>Radius: <input type="range" id="ico-sphere-radius" min="0.1" max="2.0" step="0.1" value="${mesh.scaling.x}"></label>
		`;
		ui.style.display = 'block';

        document.getElementById('ico-sphere-radius')?.addEventListener('input', (event) => {
            updateIcoSphereSize('radius', (event.target as HTMLInputElement).value, mesh.name);
        });


	}
}

function updateIcoSphereSize(dimension: string, value: string, meshName: string): void {
	const mesh = scene.getMeshByName(meshName);
	const numValue = parseFloat(value);
	if (mesh) {
		switch (dimension) {
			case 'radius':
				mesh.scaling.x = numValue;
				mesh.scaling.y = numValue;
				mesh.scaling.z = numValue;
				break;
		}
	}
}

function hideCurrentUI(): void {
    const ui = document.getElementById('ui-container');
    if (ui) {
        ui.style.display = 'none';
        ui.innerHTML = '';
    }
}

function showCubeUI(mesh: Mesh): void {
    const ui = document.getElementById('ui-container');
    if (ui) {
        ui.innerHTML = `
            <label>Width: <input type="range" id="cube-width" min="0.1" max="2.0" step="0.1" value="${mesh.scaling.x}"></label>
            <label>Height: <input type="range" id="cube-height" min="0.1" max="2.0" step="0.1" value="${mesh.scaling.y}"></label>
            <label>Depth: <input type="range" id="cube-depth" min="0.1" max="2.0" step="0.1" value="${mesh.scaling.z}"></label>
        `;
        ui.style.display = 'block';

        document.getElementById('cube-width')?.addEventListener('input', (event) => {
            updateCubeSize('width', (event.target as HTMLInputElement).value, mesh.name);
        });

        document.getElementById('cube-height')?.addEventListener('input', (event) => {
            updateCubeSize('height', (event.target as HTMLInputElement).value, mesh.name);
        });

        document.getElementById('cube-depth')?.addEventListener('input', (event) => {
            updateCubeSize('depth', (event.target as HTMLInputElement).value, mesh.name);
        });
    }
}


function updateCubeSize(dimension: string, value: string, meshName: string): void {
    const mesh = scene.getMeshByName(meshName);
    const numValue = parseFloat(value);
    if (mesh) {
        switch (dimension) {
            case 'width':
                mesh.scaling.x = numValue;
                break;
            case 'height':
                mesh.scaling.y = numValue;
                break;
            case 'depth':
                mesh.scaling.z = numValue;
                break;
        }
    }

}

function applyBouncing(node: Mesh, amplitude: number, totalDuration: number): void {
    const gravity = -9.81; // m/s^2, acceleration due to gravity
    let bounceAnimation = new BABYLON.Animation(
        "bounce",
        "position.y",
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      ) as unknown as import("babylonjs/Animations/animation").Animation;
    const keyFrames = [];
    let bounceTime = Math.sqrt(2 * amplitude / -gravity);
    let endTime = 0;
    let height = amplitude;

    // Calculate the time for each bounce and its height
    while(endTime < totalDuration && height > 0.01) {
        const startTime = endTime;
        endTime = startTime + bounceTime;
        if (endTime > totalDuration) {
            endTime = totalDuration;
        }

        keyFrames.push({ frame: startTime * 60, value: 0 });
        keyFrames.push({ frame: (startTime + bounceTime / 2) * 60, value: height });
        keyFrames.push({ frame: endTime * 60, value: 0 });

        // Decrease amplitude and bounce time for each subsequent bounce
        height *= 0.65; // energy loss on each bounce
        bounceTime *= 0.65; // shorter air time for each bounce due to energy loss
    }

    bounceAnimation.setKeys(keyFrames);

    // Easing to simulate the effect of gravity
    let easingFunction = new BABYLON.QuadraticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    bounceAnimation.setEasingFunction(easingFunction);

    node.animations.push(bounceAnimation);

    // Start animation from 0 to the last frame calculated
    scene.beginAnimation(node, 0, keyFrames[keyFrames.length - 1].frame, false);
}

function populateMeshSelector() {
    const meshSelector = document.getElementById('mesh-selector');
    if (meshSelector) {
        scene.meshes.forEach(mesh => {
            const option = document.createElement('option');
            option.value = mesh.name;
            option.textContent = mesh.name;
            meshSelector.appendChild(option);
        });

        // Add an event listener to handle selection changes
        meshSelector.addEventListener('change', (event) => {
            const selectedMeshName = (event.target as HTMLSelectElement)?.value;
            // Perform actions based on the selected mesh
            console.log(`Selected Mesh: ${selectedMeshName}`);
        });
    }
}

prepareScene();
populateMeshSelector(); // Call this after prepareScene

const applyAnimationButton = document.getElementById('apply-animation');
if (applyAnimationButton) {
    applyAnimationButton.addEventListener('click', () => {
        const amplitude = parseFloat((document.getElementById('amplitude') as HTMLInputElement).value);
        const duration = parseFloat((document.getElementById('duration') as HTMLInputElement).value);
        
        const meshSelector = document.getElementById('mesh-selector') as HTMLSelectElement;
        const selectedMeshName = meshSelector.value;

        console.log(`Attempting to apply animation to: ${selectedMeshName}`);

        const selectedMesh = scene.getMeshByName(selectedMeshName) as Mesh;
        console.log(selectedMesh);

        if (selectedMesh) {
            console.log(`Found mesh: ${selectedMesh.name}`);
            applyBouncing(selectedMesh, amplitude, duration);
        } else {
            console.error("Selected mesh not found in the scene");
        }
    });
}

// Access the existing icosphere from the scene
const existingIcosphere = scene.getMeshByName("IcoSphere") as Mesh;
if (existingIcosphere) {
    applyBouncing(existingIcosphere, 2, 2000); // Apply bouncing to the existing icosphere
}
console.log(scene.meshes.map(mesh => mesh.name));

engine.runRenderLoop(() => {
    scene.render();
});


window.addEventListener("resize", () => {
    engine.resize();
});
