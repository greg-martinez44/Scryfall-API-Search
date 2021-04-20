async function printApiResults()
{
    const outputArea = document.getElementById("results");
    const results = await callAPI();
    if (results !== "Bad Request")
    {
        outputArea.innerHTML = formatResults(results);
    } else 
    {
        outputArea.innerHTML = "<p><span style='color: red'>No results!</span></p>";
    }
}
async function callAPI(pageNumber=1, retrievedObj=null)
{
    const rawQuery = document.getElementById("query").value;
    const {columns, values, tables} = parseQuery(rawQuery);
    const url = formatURL(values, tables, pageNumber);

    if (!retrievedObj) retrievedObj = [];

    const response = await fetch(url);
    if (response.ok)
    {
        var responseObj = await response.json();
        retrievedObj = retrievedObj.concat(responseObj.data);
        if (responseObj.has_more)
        {
            return await callAPI(++pageNumber, retrievedObj);
        }
        return retrievedObj;
    }
    return "Bad Request";
}

function parseQuery(rawQuery)
{
    const queryTokens = rawQuery.toLowerCase().split(" ");
    if (!queryTokens.some((token) => token === "where")) throw new SyntaxError("Query must have where clause");

    const selectIndex = queryTokens.indexOf("select");
    const fromIndex = queryTokens.indexOf("from");
    const whereIndex = queryTokens.indexOf("where");

    let columns = queryTokens
        .slice(selectIndex+1, fromIndex)
        .map((item) => item.replace(/,/g, ""))
        .filter((item) => item !== "")

    let rawValues = queryTokens.slice(whereIndex+1).join(" ");
    rawValues = rawValues.replace(/, /g, "-");
    let values = rawValues.split(" ");
    values = values.map((item) => item.replace(/-/g, ", "));

    const queryParams = {
        columns: columns,
        values: values,
        tables: queryTokens.slice(fromIndex+1, whereIndex)
    };
    return queryParams;
}

function formatURL(values, tables, pageNumber)
{
    const urlTable = tables[0];
    let urlQueryString = "";
    while (values.length > 0) {

        let nextEqualSign = values.indexOf("=");
        urlQueryString += `${values[nextEqualSign-1]}%3A`

        let nextAnd = findNextAnd(values);
        let currentValues = values.slice(nextEqualSign+1, nextAnd);
        if (parseInt(currentValues))
        {
            urlQueryString += `${parseInt(currentValues.join(" "))}`;
        } else
        {
            urlQueryString += `'${currentValues.join(" ")}'`;
        }
        values = values.slice(nextAnd+1);
    }
    return `https://api.scryfall.com/${urlTable}/search?order=set&q=${urlQueryString}&page=${pageNumber}`;
}


function formatResults(results)
{
    let output = "";
    results.forEach((result) =>
    {
        const {name, image, oracleText, color} = resultAttributes(result);

        const imageHTML = (
            `<img class="cardImage" src=${image.small} alt=${name}\
            width="300px" height="400px">`
        );
        const detailsHTML = 
            `<p class="cardName">${name}</p>`
            + `<p class="cardColor">${color}</p>`
            + `<p class="cardText">${oracleText}</p>`;
        output += `<div class="cardResults">${imageHTML}${detailsHTML}</div>`;
    });
    return output;
}

function resultAttributes(result)
{
    return {
        name: result.name || "",
        image: result.image_uris || "",
        oracleText: result.oracle_text || "",
        color: (result.colors) ? result.colors.join("") : ""
    };
}

function findNextAnd(values)
{
    const nextAnd = values.indexOf("and");
    if (nextAnd === -1) return values.length;
    return nextAnd;
}

try {
    module.exports.parseQuery = parseQuery;
} catch (ReferenceError) {

}

