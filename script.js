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
        tabsData[tabName][fieldName] = json[key];
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
            fieldRow.querySelector("input:nth-child(3)").value = tabContent[fieldKey];
            rowNum++; 
        }
    }

    updateFileName(jsonFileInput.value);
}



function addNewField(tab) {
    const newRow = document.createElement("div");
    newRow.className = "field-row table-row";
    const rowCount = tab.querySelectorAll('.field-row').length + 1;
    newRow.innerHTML = `
    <div class="table-cell row-number">${rowCount}</div>
    <input type="text" class="table-cell" placeholder="SubCategoría" oninput="formatSubcategory(this)">
    <input type="text" class="table-cell" placeholder="Traducción" oninput="capitalizeFirstLetter(this)">
    <button class="move-row-btn table-cell" onclick="moveRowPrompt(this)"><i class="fas fa-retweet"></i></button>
    <button class="delete-row-btn table-cell" onclick="confirmRemoveField(this)">X</button>
    <button class="copy-row-btn table-cell" onclick="copyField(this)"><i class="far fa-copy"></i></button>
    `;
    tab.querySelector(".tab-content").appendChild(newRow);
    updateRowNumbers(tab);
    return newRow;
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
    fieldRow.style.backgroundColor = 'lightgreen';
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
    tabTitle.placeholder = "Nombre de la pestaña";
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
            json[key] = inputs[1].value;
        }
    }

    return json;
}



jsonFileInput.addEventListener("change", (event) => {
const file = event.target.files[0];
const reader = new FileReader();
reader.onload = (e) => {
    try {
        const json = JSON.parse(e.target.result);

        const isFormatValid = Object.values(json).every(
            (value) => typeof value === "string"
        );
        if (!isFormatValid) {
            throw new Error("Invalid JSON format");
        }

    if (
        confirm(
            "Este archivo es aceptable, se importará y reemplazarán los datos de esta página. ¿Continuar?"
        )
    ) {
        loadJson(json);
        updateFileName(file.name);
    }
} catch (error) {
    alert("Este archivo no es compatible.");
}
};
reader.readAsText(file);
});


function updateFileName(name) {
fileNameInput.value = name.replace(/\.[^/.]+$/, "");
}


function downloadJson(json, fileName) {
const data = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
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

function updateRowNumbers(tab) {
    const rows = tab.querySelectorAll('.field-row');
    for (let i = 0; i < rows.length; i++) {
        const rowNumberCell = rows[i].querySelector('.row-number');
        rowNumberCell.textContent = i + 1;
    }
}

function correctSpelling() {
    const translationInputs = document.querySelectorAll('input[type="text"]:nth-child(3)');

    for (let input of translationInputs) {
        let value = input.value.toLowerCase();
        value = value.replace(/([a-z])/, function(match) {
            return match.toUpperCase();
        });
        value = value.replace(/([.!?])\s*(\w)/g, function(match, punctuation, letter) {
            return punctuation + " " + letter.toUpperCase();
        });

        input.value = value;
    }
}

window.addEventListener('beforeunload', (event) => {
    // Cancela el evento tal como estándares modernos requieren
    event.preventDefault();
    // Chrome requiere que se establezca el valor de returnValue
    event.returnValue = '';
});
