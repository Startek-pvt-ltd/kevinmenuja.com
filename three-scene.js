(function () {
  window.initPortfolioThree = function initPortfolioThree(THREE) {
    const canvas = document.querySelector("#three-canvas");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canvas || reduceMotion) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 120);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    const pointer = new THREE.Vector2(0, 0);
    const cameraTarget = new THREE.Vector3(0, 0, 18);
    const clock = new THREE.Clock();
    const mainGroup = new THREE.Group();
    const orbitGroup = new THREE.Group();
    const shardGroup = new THREE.Group();
    const scrollState = { progress: 0, impulse: 0 };

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    camera.position.copy(cameraTarget);
    scene.add(mainGroup);
    mainGroup.add(orbitGroup);
    mainGroup.add(shardGroup);

    const blue = new THREE.Color("#19b7ff");
    const purple = new THREE.Color("#8f4cff");
    const pink = new THREE.Color("#ec5cff");

    const coreMaterial = new THREE.MeshStandardMaterial({
      color: "#101426",
      emissive: "#112b55",
      emissiveIntensity: 0.6,
      metalness: 0.72,
      roughness: 0.18,
      transparent: true,
      opacity: 0.72,
    });

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: blue,
      wireframe: true,
      transparent: true,
      opacity: 0.34,
    });

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.15, 1), coreMaterial);
    const wireCore = new THREE.Mesh(new THREE.IcosahedronGeometry(2.22, 1), wireMaterial);
    core.position.set(4.2, 0.4, -7);
    wireCore.position.copy(core.position);
    mainGroup.add(core, wireCore);

    const torusMaterial = new THREE.MeshBasicMaterial({
      color: purple,
      transparent: true,
      opacity: 0.28,
      wireframe: true,
    });

    const ringOne = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.012, 12, 160), torusMaterial);
    const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.01, 12, 180), torusMaterial.clone());
    const ringThree = new THREE.Mesh(new THREE.TorusGeometry(6.8, 0.008, 12, 220), torusMaterial.clone());
    ringTwo.material.color = pink;
    ringThree.material.color = blue;
    ringOne.rotation.x = 1.25;
    ringTwo.rotation.x = 0.95;
    ringTwo.rotation.y = 0.45;
    ringThree.rotation.x = 1.45;
    ringThree.rotation.z = 0.28;
    orbitGroup.position.copy(core.position);
    orbitGroup.add(ringOne, ringTwo, ringThree);

    const pointGeometry = new THREE.BufferGeometry();
    const pointCount = 720;
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);

    for (let index = 0; index < pointCount; index += 1) {
      const radius = 10 + Math.random() * 18;
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * 16;
      const color = index % 3 === 0 ? blue : index % 3 === 1 ? purple : pink;

      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = elevation;
      positions[index * 3 + 2] = Math.sin(angle) * radius - 18;
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }

    pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const points = new THREE.Points(
      pointGeometry,
      new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    scene.add(points);

    const shardMaterials = [blue, purple, pink].map((color) =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.32,
        metalness: 0.38,
        roughness: 0.24,
        transparent: true,
        opacity: 0.36,
      })
    );

    for (let index = 0; index < 22; index += 1) {
      const geometry =
        index % 2 === 0
          ? new THREE.TetrahedronGeometry(0.18 + Math.random() * 0.32)
          : new THREE.OctahedronGeometry(0.14 + Math.random() * 0.28);
      const shard = new THREE.Mesh(geometry, shardMaterials[index % shardMaterials.length]);
      shard.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 9,
        -8 - Math.random() * 18
      );
      shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      shard.userData = {
        speed: 0.35 + Math.random() * 0.8,
        drift: Math.random() * Math.PI * 2,
      };
      shardGroup.add(shard);
    }

    const keyLight = new THREE.PointLight("#19b7ff", 2.8, 42);
    const rimLight = new THREE.PointLight("#ec5cff", 2.2, 38);
    const softLight = new THREE.AmbientLight("#8f4cff", 0.8);
    keyLight.position.set(6, 5, 8);
    rimLight.position.set(-8, -3, 4);
    scene.add(keyLight, rimLight, softLight);

    const onPointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollState.progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    const onResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const pulseScene = () => {
      scrollState.impulse = 1;
    };

    document.querySelectorAll(".btn, .service-card, .project-card, .subbrand-card").forEach((element) => {
      element.addEventListener("mouseenter", pulseScene);
    });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    document.body.classList.add("three-ready");

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const pulse = 1 + scrollState.impulse * 0.08;

      scrollState.impulse *= 0.92;

      mainGroup.rotation.y = pointer.x * 0.12 + scrollState.progress * 0.55;
      mainGroup.rotation.x = -pointer.y * 0.08;
      mainGroup.position.y = scrollState.progress * -1.2;

      core.rotation.x += 0.004 + scrollState.impulse * 0.006;
      core.rotation.y += 0.006 + scrollState.impulse * 0.008;
      core.scale.setScalar(pulse);
      wireCore.rotation.copy(core.rotation);
      wireCore.scale.setScalar(1.02 + scrollState.impulse * 0.1);

      orbitGroup.rotation.y += 0.004;
      orbitGroup.rotation.z = Math.sin(elapsed * 0.28) * 0.18;
      ringOne.rotation.z += 0.003;
      ringTwo.rotation.z -= 0.0025;
      ringThree.rotation.z += 0.0018;

      points.rotation.y = elapsed * 0.018 + pointer.x * 0.04;
      points.rotation.x = pointer.y * 0.025;

      shardGroup.children.forEach((shard) => {
        shard.rotation.x += 0.004 * shard.userData.speed;
        shard.rotation.y += 0.006 * shard.userData.speed;
        shard.position.y += Math.sin(elapsed * shard.userData.speed + shard.userData.drift) * 0.0025;
      });

      cameraTarget.x = pointer.x * 0.9;
      cameraTarget.y = pointer.y * 0.45;
      cameraTarget.z = 18 - scrollState.progress * 2.4;
      camera.position.lerp(cameraTarget, 0.045);
      camera.lookAt(0, 0, -10);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();
  };
})();
