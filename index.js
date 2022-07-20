const chalk = require("chalk");
const figlet = require("figlet");
const inquirer = require("inquirer");

const questions = [
    {
        type: "input",
        name: "authorization",
        message: color("key Auth ="),
        prefix: `${color("-", "blueBright")}`,
        suffix: "",
        validate: function (input) {
            const done = this.async();
            if (!input) {
                done('${color(">>", "redBright")}', 'Kamu Perlu Memberikan keys Auth Sebagai  Object');
                return false;
            }
            let authParse;
            try {
                authParse = JSON.parse(input);
            } catch (error) {
                authParse = error.message;
            }
            if (typeof authParse != 'object') {
                done('Kamu Perlu Memberikan keys Auth Sebagai Object');
                return false;
            }
            return done(null, true);
        },
    },
    {
        type: "list",
        name: "round",
        message: color("Enter Keys Auth 'Round' ="),
        prefix: `${color("-", "blueBright")}`,
        suffix: "",
        choices: ["Stage 1", "Stage 2", "Stage 3"],
        filter: (value) => {
            return {
                "Stage 1": 1,
                "Stage 2": 2,
                "Stage 3": 3,
            }[value];
        },
    },
    {
        type: "input",
        name: "interval",
        message: color("Interval Delay ="),
        prefix:`${color("-", "blueBright")}`,
        suffix: "",
        validate: function (input) {
            const done = this.async();
            if (input && isNaN(input)) {
                done('${color(">>", "redBright")} Kamu Harus Memasukkan Delay');
                return false;
            }
            return done(null, true);
        },
    }
];

inquirer.prompt(questions)
    .then(async ({ authorization, round, interval }) => {
        const authParse = JSON.parse(authorization);
        iStumble(interval, round, authParse);
    });

function iStumble(interval, round, authorization) {
    setInterval(async function iStumble() {
        try {
            const { data } = await stageRequest(authorization, round);
            if (typeof data == "string" && data.includes("BANNED")) {
                console.error(color("BANNED", "redBright"));
            } else if (typeof data == "object") {
                const date = new Date();
                let { Id, Username, Country, Region, Crowns, SkillRating } = data.User;
                const print = `[${color(date.getHours())}:${date.getMinutes()}] ` + [color(Id, "blueBright"), color(Username, "magenta"), color(Country, "blueBright"), color(Region, "blueBright"), color(Crowns, "redBright"), color(SkillRating, "yellowBright")].join(" | ");
                console.log(print);
            }
        } catch (error) {}
    }, Number(interval));
}

function color(text, color) {
    return color ? chalk[color].bold(text) : chalk.white.bold(text);
}

function stageRequest(authorization, round) {
    return new Promise((resolve, reject) => {
        request({
            url: `http://kitkabackend.eastus.cloudapp.azure.com:5010/round/finishv2/${round}`,
            headers: {
                Authorization: JSON.stringify(authorization),
                use_response_compression: true,
                "Accept-Encoding": "gzip",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64))",
            }
        })
            .then((response) => {
                resolve(response);
            })
            .catch(reject);
    });
}
