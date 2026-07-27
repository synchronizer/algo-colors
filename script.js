
// function parseStates(css) {

//     const groups = [];


//     const blocks = [
//         ...css.matchAll(
//             /\/\*\s*@compile:state\s*\*\/([\s\S]*?)\/\*\s*@compile:end\s*\*\//g
//         )
//     ];


//     for (const block of blocks) {

//         const content = block[1];


//         const selectors = [];


//         const rules = content.matchAll(
//             /([^{}]+)\s*\{/g
//         );


//         for (const rule of rules) {

//             const selectorText = rule[1].trim();


//             selectorText
//                 .split(",")
//                 .map(s => s.trim())
//                 .filter(Boolean)
//                 .forEach(selector => {
//                     selectors.push(selector);
//                 });
//         }


//         groups.push(selectors);
//     }


//     return groups;
// }

// function parseTokens(css) {

//     const tokens = [];


//     const blocks = [
//         ...css.matchAll(
//             /\/\*\s*@compile:compute\s*\*\/([\s\S]*?)\/\*\s*@compile:end\s*\*\//g
//         )
//     ];


//     for (const block of blocks) {

//         const content = block[1];


//         // Ищем CSS переменные
//         const regex = /(--[a-zA-Z0-9_-]+)\s*:/g;


//         for (const match of content.matchAll(regex)) {

//             tokens.push(match[1]);

//         }
//     }


//     return tokens;
// }

// function combineStates(groups) {

//     return groups.reduce(
//         (result, group) => {

//             const combinations = [];

//             for (const current of result) {

//                 for (const state of group) {

//                     combinations.push([
//                         ...current,
//                         state
//                     ]);
//                 }
//             }

//             return combinations;

//         },
//         [[]]
//     );
// }

// function combinationsToAttributes(combinations) {

//     return combinations.map(combination => {

//         const attributes = {};


//         for (const selector of combination) {

//             const regex = /\[([a-zA-Z0-9_-]+)(?:="([^"]+)")?\]/g;


//             for (const match of selector.matchAll(regex)) {

//                 const name = match[1];
//                 const value = match[2];


//                 // Берём только реальные значения
//                 // [data-color-scheme] без значения пропускаем
//                 if (value !== undefined) {
//                     attributes[name] = value;
//                 }
//             }
//         }


//         return attributes;

//     });
// }

// function testTokens(attributesList, tokens) {

//     const results = [];


//     // создаём контейнер состояний
//     const parent = document.createElement("div");

//     // внутри него элемент, который читает токены
//     const element = document.createElement("div");


//     parent.appendChild(element);
//     document.body.appendChild(parent);


//     for (const attributes of attributesList) {


//         // очищаем старые состояния
//         parent
//             .getAttributeNames()
//             .forEach(name => {
//                 parent.removeAttribute(name);
//             });


//         // навешиваем состояние на родителя
//         for (const [name, value] of Object.entries(attributes)) {
//             parent.setAttribute(name, value);
//         }


//         const computed = {};


//         for (const token of tokens) {

//             // заставляем вычислить токен на дочернем элементе
//             element.style.color = `var(${token})`;


//             computed[token] =
//                 getComputedStyle(element).color;
//         }


//         element.style.color = "";


//         results.push({
//             attributes: { ...attributes },
//             tokens: computed
//         });
//     }


//     parent.remove();


//     return results;
// }



// function permutations(array) {

//     if (array.length === 1) {
//         return [array];
//     }


//     const result = [];


//     for (let i = 0; i < array.length; i++) {

//         const current = array[i];

//         const rest = [
//             ...array.slice(0, i),
//             ...array.slice(i + 1)
//         ];


//         for (const permutation of permutations(rest)) {

//             result.push([
//                 current,
//                 ...permutation
//             ]);
//         }
//     }


//     return result;
// }

// function generateSelectors(attributes) {

//     const items = Object.entries(attributes)
//         .map(([name, value]) =>
//             `[${name}="${value}"]`
//         );


//     const result = new Set();


//     // перестановки
//     function permute(array, start = 0) {

//         if (start === array.length) {

//             generateGroups(array);

//             return;
//         }


//         for (let i = start; i < array.length; i++) {

//             [
//                 array[start],
//                 array[i]
//             ] = [
//                     array[i],
//                     array[start]
//                 ];


//             permute(array, start + 1);


//             [
//                 array[start],
//                 array[i]
//             ] = [
//                     array[i],
//                     array[start]
//                 ];
//         }
//     }


//     // расстановка пробелов между селекторами
//     function generateGroups(array) {

//         const spaces = array.length - 1;


//         for (
//             let mask = 0;
//             mask < (1 << spaces);
//             mask++
//         ) {

//             let selector = array[0];


//             for (let i = 0; i < spaces; i++) {

//                 if (mask & (1 << i)) {
//                     selector += " ";
//                 }

//                 selector += array[i + 1];
//             }


//             result.add(selector);
//         }
//     }


//     if (items.length === 0) {
//         return [":root"];
//     }


//     permute(items);


//     return [...result];
// }

// function groupByTokens(results) {

//     const groups = {};


//     for (const item of results) {


//         const tokenKey = Object.entries(item.tokens)
//             .map(([name, value]) =>
//                 `${name}:${value}`
//             )
//             .join(";");


//         if (!groups[tokenKey]) {

//             groups[tokenKey] = {
//                 tokens: item.tokens,
//                 selectors: []
//             };

//         }


//         const selectors = generateSelectors(item.attributes);


//         groups[tokenKey].selectors.push(...selectors);

//     }


//     return Object.values(groups);
// }

// function generateCSS(groups) {

//     let css = "";


//     for (const group of groups) {


//         css += group.selectors.join(",\n");

//         css += " {\n";


//         for (const [name, value] of Object.entries(group.tokens)) {

//             css += `    ${name}: ${value};\n`;

//         }


//         css += "}\n\n";

//     }


//     return css;
// }

// function oklchToHex(oklch) {
//     const match = oklch.match(
//         /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/
//     );

//     if (!match) {
//         throw new Error("Invalid oklch");
//     }

//     let [_, L, C, h] = match.map(Number);

//     h = h * Math.PI / 180;

//     const a = C * Math.cos(h);
//     const b = C * Math.sin(h);

//     // OKLab → XYZ
//     let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
//     let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
//     let s_ = L - 0.0894841775 * a - 1.2914855480 * b;

//     l_ = l_ ** 3;
//     m_ = m_ ** 3;
//     s_ = s_ ** 3;

//     const X =
//         1.2268798734 * l_ -
//         0.5578149965 * m_ +
//         0.2813910502 * s_;

//     const Y =
//         -0.0405757626 * l_ +
//         1.1122868294 * m_ -
//         0.0717110667 * s_;

//     const Z =
//         -0.0763729497 * l_ -
//         0.4214933239 * m_ +
//         1.5869240244 * s_;


//     // XYZ → linear RGB

//     let r =
//         3.2404542 * X -
//         1.5371385 * Y -
//         0.4985314 * Z;

//     let g =
//         -0.9692660 * X +
//         1.8760108 * Y +
//         0.0415560 * Z;

//     let b2 =
//         0.0556434 * X -
//         0.2040259 * Y +
//         1.0572252 * Z;


//     // gamma correction

//     function gamma(x) {
//         return x <= 0.0031308
//             ? 12.92 * x
//             : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
//     }

//     r = gamma(r);
//     g = gamma(g);
//     b2 = gamma(b2);


//     function hex(x) {
//         return Math.round(
//             Math.min(1, Math.max(0, x)) * 255
//         )
//             .toString(16)
//             .padStart(2, "0");
//     }

//     return `#${hex(r)}${hex(g)}${hex(b2)}`;
// }

// function convertTokensToHex(results) {

//     return results.map(item => {

//         const tokens = {};

//         for (const [name, value] of Object.entries(item.tokens)) {

//             if (value.startsWith("oklch")) {
//                 tokens[name] = oklchToHex(value);
//             } else {
//                 tokens[name] = value;
//             }

//         }

//         return {
//             attributes: item.attributes,
//             tokens
//         };

//     });

// }

// function compileColors(css) {

//     const states = parseStates(css);

//     const tokens = parseTokens(css);


//     const combinations = combineStates(states);


//     const attributesList =
//         combinationsToAttributes(combinations);


//     const result =
//         testTokens(
//             attributesList,
//             tokens
//         );


//     const converted =
//         convertTokensToHex(result);


//     const grouped =
//         groupByTokens(converted);


//     return generateCSS(grouped);
// }



// async function loadCSS(url) {

//     const response = await fetch(url);

//     if (!response.ok) {
//         throw new Error(`Ошибка загрузки ${url}`);
//     }

//     return await response.text();
// }



// loadCSS("./_framework/src/colors.css")
//     .then(css => {

//         const generatedCSS = compileColors(css);

//         console.log(generatedCSS);

//     })
//     .catch(console.error);
// // ================================






