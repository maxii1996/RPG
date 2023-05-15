document.addEventListener("DOMContentLoaded", function() {
    const toggleDarkModeButton = document.getElementById("toggleDarkMode");

    const correctSpellingButton = document.getElementById("correctSpellingBtn");
    if (correctSpellingButton) {
        correctSpellingButton.addEventListener("click", correctSpelling);
    }

    event.preventDefault();
    event.returnValue = '';

    function toggleDarkMode() {
        const body = document.body;
        body.classList.toggle("dark-mode");
        const icon = toggleDarkModeButton.querySelector("i");

        if (body.classList.contains("dark-mode")) {
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
        } else {
            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
        }
    }

    if (toggleDarkModeButton) {
        toggleDarkModeButton.addEventListener("click", toggleDarkMode);
    }

    window.addEventListener("scroll", function() {
        const scrollBtn = document.getElementById("scrollBtn");
        if (scrollBtn) {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                scrollBtn.classList.add("show-scroll-btn");
            } else {
                scrollBtn.classList.remove("show-scroll-btn");
            }
        }
    });

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});



const jsonFileInput = document.getElementById("jsonFileInput");
const tabsContainer = document.getElementById("tabs");
const jsonResult = document.getElementById("jsonResult");


function loadJson(json) {
    tabsContainer.innerHTML = "";
    
    let tabsData = {};

    for (const key in json) {
        let [tabName, fieldName] = key.split(".");
        if (!(tabName in tabsData)) {
            tabsData[tabName] = {};
        }
        tabsData[tabName][fieldName] = json[key].replace(/\\\\\\\\/g, '\\\\');
    }

    for (const tabName in tabsData) {
        const tab = addNewTab();
        const tabTitle = tab.querySelector("input[type=text]");
        tabTitle.value = tabName;

        const tabContent = tabsData[tabName];
        let rowNum = 1;
        for (const fieldKey in tabContent) {
            const fieldRow = addNewField(tab);
            fieldRow.querySelector(".row-number").textContent = rowNum;

            fieldRow.querySelector("input:nth-child(2)").value = fieldKey;
            const textarea = fieldRow.querySelector("textarea");
            textarea.value = tabContent[fieldKey];

            const variablesDiv = fieldRow.parentElement.querySelector(".variables-div");
          
            updateVariables(variablesDiv, textarea.value);
            rowNum++; 
            
        }
    }

    updateFileName(jsonFileInput.value);
}

function addNewField(tab) {
    const fieldContainer = document.createElement("div");
    fieldContainer.className = "field-container";

    const variablesDiv = document.createElement("div");
    variablesDiv.className = "variables-div"; 

    fieldContainer.appendChild(variablesDiv);

    const newRow = document.createElement("div");
    newRow.className = "field-row table-row";
    const rowCount = tab.querySelectorAll('.field-row').length + 1;
    newRow.innerHTML = `
        <div class="table-cell row-number">${rowCount}</div>
        <input type="text" class="table-cell" placeholder="SubCategoría" oninput="formatSubcategory(this)">
        <textarea class="table-cell full-width" placeholder="Traducción" oninput="handleTranslationChange(this); autoExpandTextarea(this)"></textarea>
        <button class="toggleHeightBtn table-cell"><i class="fas fa-expand-arrows-alt"></i></button>
        <button class="move-row-btn table-cell" onclick="moveRowPrompt(this)"><i class="fas fa-retweet"></i></button>
        <button class="delete-row-btn table-cell" onclick="confirmRemoveField(this)">X</button>
        <button class="copy-row-btn table-cell" onclick="copyField(this)"><i class="far fa-copy"></i></button>
        <button class="reveal-btn table-cell" onclick="revealButtons(this)"><i class="fas fa-eye"></i></button>
    `;

    const toggleHeightBtn = newRow.querySelector('.toggleHeightBtn');
    let isExpanded = true;

    const translationTextarea = newRow.querySelector('textarea');
    translationTextarea.style.whiteSpace = 'nowrap';
    translationTextarea.style.height = 'auto';

    toggleHeightBtn.addEventListener('click', function () {
        if (isExpanded) {
            translationTextarea.style.height = '10rem';
            translationTextarea.style.whiteSpace = 'pre-wrap';
            isExpanded = false;
        } else {
            translationTextarea.style.whiteSpace = 'nowrap';
            translationTextarea.style.height = 'auto';
            isExpanded = true;
        }
    });

    translationTextarea.addEventListener('click', function () {
        if (!isExpanded) {
            translationTextarea.style.height = '10rem';
            translationTextarea.style.whiteSpace = 'pre-wrap';
            isExpanded = true;
        }
    });

    translationTextarea.addEventListener('blur', function () {
        if (isExpanded) {
            translationTextarea.style.whiteSpace = 'nowrap';
            translationTextarea.style.height = 'auto';
            isExpanded = false;
        }
    });

    fieldContainer.appendChild(newRow);

    const subRow = document.createElement('div');
    subRow.className = "sub-row"; 

    fieldContainer.appendChild(subRow);

    translationTextarea.oninput = function() {
        updateVariables(variablesDiv, this.value);
        capitalizeFirstLetter(this);
    };

    subRow.classList.add('show'); 

    const tabContent = tab.querySelector(".tab-content");
    tabContent.appendChild(fieldContainer);

    updateRowNumbers(tab);
    return newRow;
}





function autoExpandTextarea(textarea) {
    const lines = textarea.value.split('\n');
    textarea.rows = lines.length;
}



function toggleSubpage(btn) {
    const content = btn.nextElementSibling;
    const isExpanded = content.style.display !== 'none';
    content.style.display = isExpanded ? 'none' : 'block';
    btn.querySelector("i").className = isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
}

function moveRowPrompt(btn) {
    const row = btn.parentElement;
    const allRows = Array.from(row.parentElement.querySelectorAll('.field-row'));
    const subCategory = row.querySelector('input[type="text"]').value;

    const currentRowNum = allRows.indexOf(row) + 1;
    const targetRowNum = prompt(`Estás modificando: ${currentRowNum}: ${subCategory}\n\nSelecciona a qué número de línea quieres cambiarlo.`, "");

    if (targetRowNum === null) {
        return;
    }

    const targetRowNumInt = parseInt(targetRowNum);

    if (isNaN(targetRowNumInt) || targetRowNumInt < 1 || targetRowNumInt > allRows.length) {
        alert("Número de línea inválido. Por favor, introduce un número válido.");
        return;
    }

    if (targetRowNumInt === currentRowNum) {
        alert("Estás intentando mover la línea a su posición actual. Por favor, introduce un número de línea diferente.");
        return;
    }

    const targetRow = allRows[targetRowNumInt - 1];
    
    const confirmMove = confirm(`La línea ${currentRowNum}: ${subCategory} se ubicará en la posición: ${targetRowNum}. ¿Continuar?`);

    if (confirmMove) {
        if (targetRowNumInt < currentRowNum) {
            row.parentElement.insertBefore(row, targetRow);
        } else {
            if(targetRow.nextSibling) {
                row.parentElement.insertBefore(row, targetRow.nextSibling);
            } else {
                row.parentElement.appendChild(row);
            }
        }
    }

    updateRowNumbers(row.parentElement);
}


function copyField(btn) {
    const fieldRow = btn.parentElement;
    const tabTitle = fieldRow.closest('.tab').querySelector('input[type="text"]').value;
    const subcategory = fieldRow.querySelector('input[type="text"]:nth-child(2)').value;
    const copyText = `\${${tabTitle}.${subcategory}}`;
    navigator.clipboard.writeText(copyText);
    const originalColor = fieldRow.style.backgroundColor;
    fieldRow.style.backgroundColor = '#286b41';
    setTimeout(() => {
        fieldRow.style.backgroundColor = originalColor;
    }, 95);
}


function formatSubcategory(input) {
input.value = input.value.toLowerCase().replace(/[^a-z_]/g, "").replace(/-/g, "_");
}

function formatTabTitle(input) {
input.value = input.value.replace(/[^a-z_]/g, "").replace(/-/g, "_");
}

function capitalizeTranslation(input) {
input.value = input.value.replace(/(^|\s)[a-z]/g, function (match) {
return match.toUpperCase();
});
}

function capitalizeFirstLetter(input) {
    input.value = input.value.charAt(0).toUpperCase() + input.value.slice(1);
}


function removeField(btn) {
    const tab = btn.closest('.tab');
    btn.parentElement.remove();
    updateRowNumbers(tab);
}

function updateRowNumbers(tab) {
    const rows = tab.querySelectorAll('.field-row');
    for (let i = 0; i < rows.length; i++) {
        const rowNumberCell = rows[i].querySelector('.row-number');
        rowNumberCell.textContent = i + 1;
    }
}


function addNewTab() {
    const newTab = document.createElement("div");
    newTab.className = "tab";

    const tabTitle = document.createElement("input");
    tabTitle.type = "text";
    tabTitle.placeholder = "Clave (Texto inicial)";
    tabTitle.oninput = function() { formatTabTitle(this); };

    const tabContent = document.createElement("div");
    tabContent.className = "tab-content";

    newTab.appendChild(tabTitle);
    newTab.appendChild(tabContent);
    tabsContainer.appendChild(newTab);

    const addFieldButton = document.createElement("button");
    const addFieldIcon = document.createElement("i");
    addFieldIcon.className = "fas fa-plus";
    addFieldButton.appendChild(addFieldIcon);
    addFieldButton.className = "add-field-btn";
    addFieldButton.onclick = () => addNewField(newTab);
    newTab.appendChild(addFieldButton);

    const compileAndSaveButton = document.createElement("button");
    const compileAndSaveIcon = document.createElement("i");
    compileAndSaveIcon.className = "fas fa-save";
    compileAndSaveButton.appendChild(compileAndSaveIcon);
    compileAndSaveButton.className = "compile-and-save-btn";
    compileAndSaveButton.onclick = () => saveChanges();
    newTab.appendChild(compileAndSaveButton);

    const scrollTopButton = document.createElement("button");
    const scrollTopIcon = document.createElement("i");
    scrollTopIcon.className = "fas fa-arrow-up";
    scrollTopButton.appendChild(scrollTopIcon);
    scrollTopButton.className = "scroll-top-btn";
    scrollTopButton.onclick = () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
    newTab.appendChild(scrollTopButton);

    const saveChangesBtn = document.querySelector(".save-changes-btn");
    if (tabsContainer.children.length === 0) {
        saveChangesBtn.style.display = "none";
    } else {
        saveChangesBtn.style.display = "block";
        saveChangesBtn.disabled = false;
    }

    return newTab;
}



function generateJson() {
    const json = {};

    for (const tab of tabsContainer.children) {
        const tabTitle = tab.querySelector("input[type=text]").value;

        const rows = tab.querySelectorAll(".field-row");
        for (const row of rows) {
            const inputs = row.querySelectorAll("input");
            const key = `${tabTitle}.${inputs[0].value}`;
            const value = row.querySelector("textarea").value;
            json[key] = value;
        }
    }

    return json;
}


jsonFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const raw = e.target.result;
            const json = JSON.parse(raw);

            for (let key in json) {
                json[key] = json[key].replace(/\\\\/g, "\\\\\\\\");
            }

            if (
                confirm(
                    "Este archivo se importará y reemplazará los datos de esta página. ¿Continuar?"
                )
            ) {
                loadJson(json);
                updateFileName(file.name);
            }
        } catch (error) {
            alert("Error al leer el archivo: " + error.message);
        }
    };
    reader.readAsText(file);
});

function handleFileSelect(evt) {
    var file = evt.target.files[0];
    if (!file) return;
  
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      var json = JSON.parse(contents);
      var templateLiterals = JSON.stringify(json, null, 2)
        .replace(/"\\\\/g, '`\\\\')
        .replace(/\\\\n"/g, '\\\\n`')
        .replace(/"$/g, '`')
        .replace(/^"/g, '`');
      var templateLiteralJson = JSON.parse(templateLiterals);
      fillTableFromJson(templateLiteralJson);
    };
    reader.readAsText(file);
  }
  

  

function updateFileName(name) {
fileNameInput.value = name.replace(/\.[^/.]+$/, "");
}


function downloadJson(json, fileName) {
    let jsonString = JSON.stringify(json, null, 2);
    jsonString = jsonString.replace(/\\\\\\\\/g, "\\\\");
    const data = new Blob([jsonString], {type: "application/json"});
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}




function saveChanges() {
    const json = generateJson();
    const fileName = fileNameInput.value;
    jsonResult.value = JSON.stringify(json, null, 2);
    downloadJson(json, fileName);

    const saveChangesBtn = document.querySelector(".save-changes-btn");
    if (tabsContainer.children.length === 0) {
        saveChangesBtn.disabled = true;
    } else {
        saveChangesBtn.disabled = false;
    }
}


function confirmRemoveField(btn) {
if (confirm("¿Está seguro de que desea eliminar esta línea?")) {
removeField(btn);
}
}


function correctSpelling() {
    const translationInputs = document.querySelectorAll('textarea');

    for (let input of translationInputs) {
        let value = input.value.toLowerCase();
        let parts = value.split(/(\$\{[^}]*\})/g);
        for (let i = 0; i < parts.length; i++) {
            if (!parts[i].startsWith("${")) { 
                parts[i] = parts[i].replace(/([a-z])/, function(match) {
                    return match.toUpperCase();
                });
                parts[i] = parts[i].replace(/([.!?])\s*(\w)/g, function(match, punctuation, letter) {
                    return punctuation + " " + letter.toUpperCase();
                });
            }
        }
        input.value = parts.join(""); 
    }
}



window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';
});


function revealButtons(btn) {
   
    const fieldRow = btn.parentElement;
    const translationInput = fieldRow.querySelector("textarea");

    const buttonData = [
        { insertText: "<b> </b>", iconClass: "fas fa-bold", description: "Texto en negrita" },
        { insertText: "<i> </i>", iconClass: "fas fa-italic", description: "Texto en cursiva" },
        { insertText: "<left> </left>", iconClass: "fas fa-align-left", description: "Alinear a la izquierda" },
        { insertText: "<center> </center>", iconClass: "fas fa-align-center", description: "Alinear al centro" },
        { insertText: "<right> </right>", iconClass: "fas fa-align-right", description: "Alinear a la derecha" },
        { insertText: "<WordWrap> </WordWrap>", iconClass: "fas fa-text-width", description: "Ajuste de línea de texto" },
        { insertText: "<br>", iconClass: "fas fa-level-down-alt", description: "Salto de línea" },
        { insertText: "<line break>", iconClass: "fas fa-level-down-alt", description: "Salto de línea" },
        { insertText: "\\picture<x>", iconClass: "fas fa-image", description: "Insertar imagen" },
        { insertText: "\\CenterPicture<x>", iconClass: "fas fa-image", description: "Insertar imagen centrada" },
        { insertText: "\\Wait[x]", iconClass: "fas fa-hourglass-half", description: "Esperar [x] segundos" },
        { insertText: "<Help> </Help>", iconClass: "fas fa-question-circle", description: "Ayuda" },
        { insertText: "<Up Button>", iconClass: "fas fa-arrow-up", description: "Botón de flecha hacia arriba" },
        { insertText: "<Left Button>", iconClass: "fas fa-arrow-left", description: "Botón de flecha hacia la izquierda" },
        { insertText: "<Right Button>", iconClass: "fas fa-arrow-right", description: "Botón de flecha hacia la derecha" },
        { insertText: "<Down Button>", iconClass: "fas fa-arrow-down", description: "Botón de flecha hacia abajo" },
        { insertText: "<Ok Button>", iconClass: "fas fa-check", description: "Botón de aceptar" },
        { insertText: "<Cancel Button>", iconClass: "fas fa-times", description: "Botón de cancelar" },
        { insertText: "<Shift Button>", iconClass: "fas fa-exchange-alt", description: "Botón de cambio" },
        { insertText: "<Menu Button>", iconClass: "fas fa-bars", description: "Botón de menú" },
        { insertText: "<Page Up Button>", iconClass: "fas fa-chevron-circle-up", description: "Botón de página arriba" },
        { insertText: "<Page Down Button>", iconClass: "fas fa-chevron-circle-down", description: "Botón de página abajo" },
        { insertText: "\\FS[x]", iconClass: "fas fa-text-height", description: "Tamaño de fuente [x]" },
        { insertText: "\\CommonEvent[x]", iconClass: "fas fa-cogs", description: "Evento común [x]" },
        { insertText: "\\Wait[x]", iconClass: "fas fa-hourglass-half", description: "Esperar [x] segundos" },
        { insertText: "<Next Page>", iconClass: "fas fa-forward", description: "Siguiente página" },
        { insertText: "<Auto>", iconClass: "fas fa-car-side", description: "Automático" },
        { insertText: "<Auto Width>", iconClass: "fas fa-arrows-alt-h", description: "Ancho automático" },
        { insertText: "<Auto Height>", iconClass: "fas fa-arrows-alt-v", description: "Altura automática" },
        { insertText: "<Auto Actor: x>", iconClass: "fas fa-user", description: "Actor automático: [x]" },
        { insertText: "<Auto Party: x>", iconClass: "fas fa-users", description: "Grupo automático: [x]" },
        { insertText: "<Auto Player>", iconClass: "fas fa-gamepad", description: "Jugador automático" },
        { insertText: "<Auto Event: x>", iconClass: "fas fa-calendar-alt", description: "Evento automático: [x]" },
        { insertText: "<Auto Enemy: x>", iconClass: "fas fa-skull-crossbones", description: "Enemigo automático: [x]" },
    ];
    
    
    const subRow = fieldRow.nextElementSibling;


    if (subRow.classList.contains('hidden')) {

        subRow.classList.remove('hidden');

        subRow.innerHTML = '';

        for (const btnData of buttonData) {
            const insertButton = document.createElement('button');
        
            const icon = document.createElement('i');
            icon.className = btnData.iconClass;
            insertButton.appendChild(icon);
            insertButton.title = btnData.description;
        
            insertButton.onclick = () => {
                translationInput.value += btnData.insertText;
                handleTranslationChange(translationInput);
            };
            subRow.appendChild(insertButton);
        }
        
    } else {
   
        subRow.classList.add('hidden');
    }
}


function updateVariables(variablesDiv, text) {
    const regex1 = /\\\\[^\s]+/g;
    const regex2 = /\$\{[^\}]+\}/g;
    const matches1 = text.match(regex1);
    const matches2 = text.match(regex2);
    let output = '<div class="variables">Variables Utilizadas: ';
    if (matches2) {
        output += matches2.join(', ');
    } else {
        output += 'Ninguna';
    }
    output += '</div><div class="commands">Comandos Utilizados: ';
    if (matches1) {
        output += matches1.join(', ');
    } else {
        output += 'Ninguno';
    }
    output += '</div>';
    variablesDiv.innerHTML = output;
    variablesDiv.className = "variables-div hidden flex-container";

    variablesDiv.classList.remove('hidden');
}
