var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve);
  });
};

var parseMetadata = metadata => {
  const { mainStructureMembers: measuresMap } = metadata;
  const measures = [];
  for (const key in measuresMap) {
    const measure = measuresMap[key];
    measures.push({ key, ...measure });
  }
  return { measures, measuresMap };
};

(function () {
  
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
  @import url('https://fonts.googleapis.com/css2?family=Asap:ital,wght@0,100..900;1,100..900&display=swap');

  .container {
    width: 100%;
    height: 100%;
    padding: 0;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    border-radius: 8px;
    font-family: "Asap", sans-serif;
    font-optical-sizing: auto;
    box-shadow: 2px 2px 4px 0px gray;
    background-color: white;
    position: relative;
}

.title {
    font-size: 16px;
    color: #000;
    font-weight: bold;
    margin: 15px;
    position: absolute;
    top: 0;
    left: 0;
}

.wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
    position: relative;
}

.details {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    position: relative;
}

.value {
    color: #333;
    font-size: 30px;
    position: absolute;
    bottom: 10px; 
    left: 10px;   
}

.semaforo {
    width: 50%;
    padding-top: 50%;
    background-color: green;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
    .amarillo{
    display: none;
    }
    .rojo{
    display: none;
    }
    .informacion{
    display: none;
    }
</style>



<div class="wrapper">

  <div class="container">
      <div class="details">
          <h1 class="title"></h1>
          <div id="semaforo" class="semaforo"></div>
          <p class="resultado" id="resultado"></p>
          <p class="amarillo"></p>
          <p class="rojo"></p>
          <div class="value">75.45</div>
          <p class="informacion"></p>
      </div>
  </div>
</div>
  `;

  class Main extends HTMLElement {
    constructor() {
      super();

      this._shadowRoot = this.attachShadow({ mode: 'open' });
      this._shadowRoot.appendChild(template.content.cloneNode(true));

      
      this._root = this._shadowRoot.querySelector('.container');
      this._titleElement = this._shadowRoot.querySelector('.title');
      this._amarilloElement = this._shadowRoot.querySelector('.amarillo');
      this._informationElement = this._shadowRoot.querySelector('.informacion');
      this._rojoElement = this._shadowRoot.querySelector('.rojo');
      this._valueElement = this._shadowRoot.querySelector('.value');
      this._resultadoElement = this._shadowRoot.getElementById('resultado');
      this._props = {};
      this._setupObserver();
    }

    static get observedAttributes() {
      return ['title', 'amarillo', 'information', 'rojo','color'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      console.log("esta cambiando ", name, " por ", newValue);
      if (name === 'title' && newValue !== oldValue) {
        this._titleElement.textContent = newValue;
      } else if (name === 'amarillo' && newValue !== oldValue) {
        this._amarilloElement.textContent = newValue;
        this.cuenta();
      } else if (name === 'information' && newValue !== oldValue) {
        this._informationElement.innerHTML = newValue;
      } else if (name === 'rojo' && newValue !== oldValue){
        this._rojoElement.textContent = newValue;
        this.cuenta();
      } else if (name === 'color' && newValue !== oldValue){
        this._resultadoElement.style.color = newValue
      }
    }

    connectedCallback() {
      if (this.hasAttribute('title')) {
        this._titleElement.textContent = this.getAttribute('title');
      }
      if (this.hasAttribute('amarillo')) {
        this._amarilloElement.textContent= this.getAttribute('amarillo');
      }
      if (this.hasAttribute('informacion')) {
        this._informationElement.innerHTML = this.getAttribute('informacion');
      }
      if (this.hasAttribute('rojo')) {
        this._rojoElement.textContent = this.getAttribute('rojo');
      }
      if (this.hasAttribute('color')) {
        this._resultadoElement.style.color = this.getAttribute('color');
      }
    }

    onCustomWidgetAfterUpdate(changedProps) {
      if (changedProps['title']) {
        this._titleElement.textContent = changedProps['title'];
      }
      if (changedProps['amarillo']) {
        this._amarilloElement.textContent = changedProps['amarillo'];
        this.cuenta();
      }
      if (changedProps['information']) {
        this._informationElement.innerHTML = changedProps['information'];
      }
      if (changedProps['rojo']) {
        this._rojoElement.textContent = changedProps['rojo'];
        this.cuenta();
      }
      if (changedProps['color']) {
        console.log("llega el changedprops ",changedProps['color']);
        this._resultadoElement.style.color = changedProps['color'];
      }
      this.render();
    }

    setTitle(newTitle) {
      this.setAttribute('title', newTitle);
    }

    setAmarillo(newAmarillo) {
      this.setAttribute('amarillo', newAmarillo);
    }

    setInformation(newInformation) {
      this.setAttribute('information', newInformation);
    }
    setRojo(newRojo) {
      this.setAttribute('rojo', newRojo);
    }
    setResultadoColor(newColor) {
      console.log("llega el newcolor ",newColor);
      this.setAttribute('color', newColor);
    }

    onCustomWidgetResize(width, height) {
      this.render();
    }

    cuenta() {
      const valueNumber = parseFloat(this._valueElement.textContent);
      const rojoNumber = parseFloat(this._rojoElement.textContent);
      const amarilloNumber = parseFloat(this._amarilloElement.textContent);
      this._semaforoElement = this._shadowRoot.getElementById('semaforo');
      if (valueNumber<=rojoNumber){
        this._semaforoElement.style.backgroundColor = 'red';
      }
      else if(valueNumber>rojoNumber && valueNumber <= amarilloNumber){
        this._semaforoElement.style.backgroundColor = 'yellow';
      }
      else if(valueNumber>amarilloNumber && valueNumber > rojoNumber){
        this._semaforoElement.style.backgroundColor = 'green';
      }
    }

    _setupObserver() {
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            console.log('El contenido ha cambiado:', this._valueElement.textContent);
            // Aquí puedes agregar la lógica que necesites ejecutar al detectar el cambio
            this.cuenta(); // Por ejemplo, recalcular y actualizar el porcentaje
          }
        }
      });

      // Iniciar la observación del elemento _valueElement
      observer.observe(this._valueElement, { childList: true, characterData: true, subtree: true });
    }

   

    async render() {
      const dataBinding = this.dataBinding;
      if (!dataBinding || dataBinding.state !== 'success') { return; }

      await getScriptPromisify('https://cdn.staticfile.org/echarts/5.0.0/echarts.min.js');

      const { data, metadata } = dataBinding;
      const { measures } = parseMetadata(metadata);

      if (measures.length === 0) return;

      const measureKey = measures[0].key;
      let value = data.length > 0 ? data[0][measureKey].raw : 0;

      value = parseFloat(value).toFixed(2);  // Redondear a dos decimales

      this._shadowRoot.querySelector('.value').textContent = `${value} `;
    }
  }
 
  customElements.define('kpi-tbnorte', Main);
})();