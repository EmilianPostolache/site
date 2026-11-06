/* Paper stock behind content; size-sensitive printed ink on both typefaces. */
(() => {
  'use strict';
  const root = document.documentElement;
  // Filter text and decorative rules separately to avoid compounding the texture.
  const ns = 'http://www.w3.org/2000/svg';
  const definitions = document.createElementNS(ns, 'svg');
  definitions.setAttribute('width', '0');
  definitions.setAttribute('height', '0');
  definitions.setAttribute('aria-hidden', 'true');
  definitions.classList.add('print-definitions');
  // Small type keeps its hairlines; display type reveals more paper tooth.
  function inkFilter(id, edge, bleed, pores) {
    return `<filter id="${id}" x="-5%" y="-15%" width="110%" height="130%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.78 0.54" numOctaves="3" seed="17" result="tooth"/>
      <feDisplacementMap in="SourceGraphic" in2="tooth" scale="${edge}" xChannelSelector="R" yChannelSelector="G" result="impression"/>
      <!-- Low-opacity capillary spread retains the original ink colour. -->
      <feGaussianBlur in="impression" stdDeviation="${bleed}" result="spread"/>
      <feComponentTransfer in="spread" result="wicking"><feFuncA type="linear" slope="0.07"/></feComponentTransfer>
      <!-- Sparse pores rather than uniform fading across every letter. -->
      <feColorMatrix in="tooth" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="pore-field"/>
      <feComponentTransfer in="pore-field" result="pores">
        <feFuncA type="table" tableValues="${pores} 0.86 0.98 0.999 1 1"/>
      </feComponentTransfer>
      <feComposite in="impression" in2="pores" operator="in" result="porous-ink"/>
      <!-- Slower pressure variation makes neighbouring strokes subtly unequal. -->
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.075" numOctaves="2" seed="43" result="pressure"/>
      <feColorMatrix in="pressure" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.08 0 0 0 0.93" result="coverage"/>
      <feComposite in="porous-ink" in2="coverage" operator="in" result="printed"/>
      <feMerge><feMergeNode in="wicking"/><feMergeNode in="printed"/></feMerge>
    </filter>`;
  }
  definitions.innerHTML = '<defs>' + inkFilter('printed-ink', 0.24, 0.06, 0.76)
    + inkFilter('printed-ink-display', 0.40, 0.10, 0.68)
    + inkFilter('printed-ink-small', 0.11, 0.03, 0.82)
    + `<filter id="printed-rule" x="-5%" y="-15%" width="110%" height="130%" color-interpolation-filters="sRGB">
      <!-- Disturb only the geometry: retain the original colour and ink coverage. -->
      <feTurbulence type="fractalNoise" baseFrequency="0.78 0.54" numOctaves="3" seed="17" result="rule-tooth"/>
      <feDisplacementMap in="SourceGraphic" in2="rule-tooth" scale="0.32" xChannelSelector="R" yChannelSelector="G"/>
    </filter></defs>`;
  document.body.prepend(definitions);
  root.classList.add('print-finish');
  // Treat both fonts as ink on the same stock, with gentler edges on small type.
  // Observe replacement labels as well (research counts and audio controls).
  const textObserver = new MutationObserver(applyInk);
  function applyInk() {
    textObserver.disconnect();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const inkRuns = [];
    while (walker.nextNode()) {
      const text = walker.currentNode;
      const parent = text.parentElement;
      if (!text.textContent.trim() || !parent ||
          parent.closest('script,style,svg,textarea,select,option,paper-ink,[contenteditable]')) continue;
      const style = getComputedStyle(parent);
      const size = parseFloat(style.fontSize);
      if (size > 0) inkRuns.push({text, size});
    }
    for (const {text, size} of inkRuns) {
      const ink = document.createElement('paper-ink');
      if (size >= 28) ink.classList.add('display-ink');
      else if (size <= 14) ink.classList.add('small-ink');
      text.replaceWith(ink);
      ink.append(text);
    }
    textObserver.observe(document.body, {childList:true, characterData:true, subtree:true});
  }
  applyInk();

  const canvas = document.createElement('canvas');
  const surface = document.createElement('div');
  surface.className = 'paper-surface';
  surface.setAttribute('aria-hidden', 'true');
  let gl;
  try {
    gl = canvas.getContext('webgl', {
      alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false,
      powerPreference: 'low-power', preserveDrawingBuffer: true
    });
  } catch { return; }
  if (!gl) return;

  const vertexSource = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;
  const fragmentSource = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform vec2 u_resolution;
    uniform float u_dark;
    float hash(vec2 p) {
      p = mod(p, 251.0);
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 437.58);
    }
    float noise(vec2 p, vec2 period) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(mod(i, period)), hash(mod(i + vec2(1.0, 0.0), period)), f.x),
                 mix(hash(mod(i + vec2(0.0, 1.0), period)), hash(mod(i + vec2(1.0), period)), f.x), f.y);
    }
    float pulp(vec2 p) {
      return noise(p * 28.0, vec2(28.0)) * 0.6
           + noise(p * 82.0 + 19.0, vec2(82.0)) * 0.3
           + noise(p * 240.0 + 7.0, vec2(240.0)) * 0.1;
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      // Seamless, document-anchored uncoated stock, lit from the upper left.
      float grain = hash(mod(floor(uv * 1024.0), 1024.0)) - 0.5;
      float body = pulp(uv) - 0.5;
      float cloud = noise(uv * 5.0 + 13.0, vec2(5.0)) - 0.5;
      vec2 lightStep = vec2(-0.9, 1.2) / 512.0;
      float relief = pulp(uv + lightStep) - pulp(uv - lightStep);
      // Two sparse, crossed fibre populations break up uniform digital noise.
      float longFiber = smoothstep(0.66, 0.88,
        noise(uv * vec2(42.0, 640.0), vec2(42.0, 640.0)));
      float crossFiber = smoothstep(0.70, 0.91,
        noise(uv * vec2(710.0, 56.0) + 17.0, vec2(710.0, 56.0)));
      float fiberMask = noise(uv * 35.0, vec2(35.0));
      float fibers = (longFiber * 0.8 + crossFiber * 0.5) * fiberMask;
      float flecks = smoothstep(0.86, 0.98, hash(floor(uv * 768.0)));
      // Almost-flat stock: retain fine tooth without visible mottling or wrinkles.
      float tone = cloud * 0.002 + body * 0.006 + grain * 0.008
                 + relief * 0.018 + fibers * 0.004 - flecks * 0.002;
      vec3 paper = mix(vec3(247.0, 244.0, 237.0) / 255.0,
                       vec3(28.0, 27.0, 26.0) / 255.0, u_dark);
      // Opaque stock replaces the old nearly invisible translucent overlay.
      // It remains behind all content; only the separate text filters affect ink.
      vec3 warmth = vec3(cloud * 0.0005, 0.0, -cloud * 0.0008);
      vec3 surface = clamp(paper + vec3(tone * mix(1.0, 0.58, u_dark)) + warmth, 0.0, 1.0);
      gl_FragColor = vec4(surface, 1.0);
    }
  `;
  let program, buffer, uniforms, frame = 0;
  function compile(type, source) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Shader unavailable');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error('Paper shader unsupported');
    }
    return shader;
  }
  function initialise() {
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Paper program unsupported');
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    uniforms = Object.fromEntries(['resolution', 'dark'].map(name => [name, gl.getUniformLocation(program, 'u_' + name)]));
  }
  function draw() {
    frame = 0;
    if (gl.isContextLost()) return;
    const w = 1024, h = 1024;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.useProgram(program);
    gl.uniform2f(uniforms.resolution, w, h);
    gl.uniform1f(uniforms.dark, root.dataset.theme === 'dark' ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    surface.style.backgroundImage = 'url(' + canvas.toDataURL('image/png') + ')';
  }
  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
  }
  try { initialise(); } catch { return; }
  document.body.append(surface);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    cancelAnimationFrame(frame); frame = 0;
  });
  canvas.addEventListener('webglcontextrestored', () => {
    try { initialise(); schedule(); } catch { /* Keep the previously baked tile. */ }
  });
  new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('visibilitychange', schedule);
  schedule();
})();
