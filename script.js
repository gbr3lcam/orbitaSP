const inputCep = document.getElementById("cep");
const botaoConsultar = document.getElementById("consultar-btn");

inputCep.addEventListener("input", () => {

    let valor = inputCep.value;

    valor = valor.replace(/\D/g, "");

    valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");

    inputCep.value = valor;

});

botaoConsultar.addEventListener("click", consultarCep);

async function consultarCep() {

    const cep = inputCep.value;

    const resposta = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
    );

    const dados = await resposta.json();

    console.log("Bairro:", dados.bairro);

    const endereco = `${dados.bairro}, São Paulo - SP`;

    const respostaGeo = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco)}&format=json&limit=1`
    );

    const dadosGeo = await respostaGeo.json();

    console.log(dadosGeo);

    if (dadosGeo.length === 0) {
        console.log("Localização não encontrada.");
        return;
    }

    const latitude = dadosGeo[0].lat;
    const longitude = dadosGeo[0].lon;

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    const respostaClima = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum&timezone=auto`
    );

    const dadosClima = await respostaClima.json();

    console.log(dadosClima);

    const chuva = dadosClima.daily.precipitation_sum[0];

    console.log("Chuva prevista:", chuva, "mm");

    let risco;

    let classe;
    let titulo;
    let descricao;
    let impactos;

    if (chuva <= 20) {

        risco = "Baixo";

        classe = "risk-low";

        titulo = "Condições favoráveis";

        descricao =
            "Não há previsão de chuva intensa para a região nas próximas 24 horas.";

        impactos = `
            <li>Nenhum impacto significativo previsto.</li>
        `;
    }

    else if (chuva <= 50) {

        risco = "Médio";

        classe = "risk-medium";

        titulo = "Condições de atenção";

        descricao =
            "Há previsão de chuva moderada para a região.";

        impactos = `
            <li>Lentidão no trânsito.</li>
            <li>Acúmulo de água em alguns pontos.</li>
        `;
    }

    else {

        risco = "Alto";

        classe = "risk-high";

        titulo = "Condições climáticas severas previstas";

        descricao =
            "Previsão de chuva intensa para a região nas próximas 24 horas.";

        impactos = `
            <li>Pontos de alagamento.</li>
            <li>Trânsito intenso.</li>
            <li>Interrupções em vias urbanas.</li>
        `;
    }

    console.log("Risco:", risco);

    const resultSection = document.getElementById("result-section");

    resultSection.style.display = "block";

    resultSection.innerHTML = `
        <p class="address">
            Risco estimado para ${cep}
            <br>
            ${dados.logradouro}, ${dados.bairro}
        </p>

        <div class="risk ${classe}">
            ${risco}
        </div>

        <h2>${titulo}</h2>

        <p class="description">
            ${descricao}
        </p>

        <div class="rain-volume">
            <strong>Volume estimado:</strong>
            ${chuva} mm
        </div>

        <div class="impacts">
            <h3>Impactos possíveis</h3>

            <ul>
                ${impactos}
            </ul>
        </div>
    `;
}