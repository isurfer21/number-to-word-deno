import { parse } from 'https://deno.land/std/flags/mod.ts';

const APPNAME = 'N2W';
const APPVER = '1.0.0';

class Args {
    constructor() {
        this.argv = parse(Deno.args);
    }
    parse(shortArg, longArg, typeArg, defaultVal) {
        let argVal;
        if (!!this.argv[shortArg] && typeof this.argv[shortArg] == typeArg) {
            argVal = this.argv[shortArg];
        } else if (!!this.argv[longArg] && typeof this.argv[longArg] == typeArg) {
            argVal = this.argv[longArg];
        } else {
            argVal = defaultVal;
        }
        return argVal;
    }
}

class IndianSystem {
    constructor() {
        this.units = ["", " one", " two", " three", " four", " five", " six", " seven", " eight", " nine"];
        this.teen = [" ten", " eleven", " twelve", " thirteen", " fourteen", " fifteen", " sixteen", " seventeen", " eighteen", " nineteen"];
        this.tens = [" twenty", " thirty", " forty", " fifty", " sixty", " seventy", " eighty", " ninety"];
        this.maxs = ["", "", " hundred", " thousand", " lakh", " crore", " arab", " kharab", " neel", " padma", " shankh", " mahasankh"];
    }

    convert(n) {
        this.input = '' + n;
        let converted = "";
        let pos = 1;
        let hun = false;
        while ((this.input.length > 0)) {
            if (pos === 1) {
                if (this.input.length >= 2) {
                    const temp = this.input.substring(this.input.length - 2, this.input.length);
                    this.input = this.input.substring(0, this.input.length - 2);
                    converted += this.digits(temp);
                } else if (this.input.length === 1) {
                    converted += this.digits(this.input);
                    this.input = "";
                }
                pos++;
            } else if (pos === 2) {
                const temp = this.input.substring(this.input.length - 1, this.input.length);
                this.input = this.input.substring(0, this.input.length - 1);
                if (converted.length > 0 && this.digits(temp) !== "") {
                    converted = `${this.digits(temp)}${this.maxs[pos]} and${converted}`;
                    hun = true;
                } else {
                    if (this.digits(temp) === "") {} else {
                        converted = (this.digits(temp) + this.maxs[pos]) + converted;
                    }
                    hun = true;
                }
                pos++;
            } else if (pos > 2) {
                if (this.input.length >= 2) {
                    const temp = this.input.substring(this.input.length - 2, this.input.length);
                    this.input = this.input.substring(0, this.input.length - 2);
                    if (!hun && converted.length > 0) {
                        converted = `${this.digits(temp)}${this.maxs[pos]} and${converted}`;
                    } else {
                        if (this.digits(temp) === "") {} else {
                            converted = this.digits(temp) + this.maxs[pos] + converted;
                        }
                    }
                } else if (this.input.length === 1) {
                    if (!hun && converted.length > 0) {
                        converted = `${this.digits(this.input)}${this.maxs[pos]} and${converted}`;
                    } else {
                        if (this.digits(this.input) === "") {} else {
                            converted = this.digits(this.input) + this.maxs[pos] + converted;
                        }
                        this.input = "";
                    }
                }
                pos++;
            }
        };
        return converted.trim();
    }

    digits(temp) {
        let converted = "";
        for (let i = temp.length - 1; i >= 0; i--) {
            const ch = (c => {
                return c.charCodeAt == null ? c : c.charCodeAt(0);
            })(temp.charAt(i)) - 48;
            if (i === 0 && ch > 1 && temp.length > 1) {
                converted = this.tens[ch - 2] + converted;
            } else if (i === 0 && ch === 1 && temp.length === 2) {
                let sum = 0;
                for (let j = 0; j < 2; j++) {
                    {
                        sum = (sum * 10) + ((c => {
                            return c.charCodeAt == null ? c : c.charCodeAt(0);
                        })(temp.charAt(j)) - 48);
                    };
                }
                return this.teen[sum - 10];
            } else {
                if (ch > 0) {
                    converted = this.units[ch] + converted;
                }
            }
        }
        return converted;
    }
}

class WesternSystem {
    constructor() {
        this.specialNames = ["", " thousand", " million", " billion", " trillion", " quadrillion", " quintillion"];
        this.tensNames = ["", " ten", " twenty", " thirty", " forty", " fifty", " sixty", " seventy", " eighty", " ninety"];
        this.numNames = ["", " one", " two", " three", " four", " five", " six", " seven", " eight", " nine", " ten", " eleven", " twelve", " thirteen", " fourteen", " fifteen", " sixteen", " seventeen", " eighteen", " nineteen"];
    }

    convertLessThanOneThousand(number) {
        let current;

        if (number % 100 < 20) {
            current = this.numNames[number % 100];
            number = Maths.integer(number / 100);
        } else {
            current = this.numNames[number % 10];
            number = Maths.integer(number / 10);

            current = this.tensNames[number % 10] + current;
            number = Maths.integer(number / 10);
        }

        if (number === 0) {
            return current;
        }

        return `${this.numNames[number]} hundred${current}`;
    }

    convert(number) {
        if (number === 0) {
            return "zero";
        }

        let prefix = "";

        if (number < 0) {
            number = -number;
            prefix = "negative";
        }

        let current = "";
        let place = 0;

        do {
            const n = number % 1000;

            if (n !== 0) {
                const s = this.convertLessThanOneThousand(n);
                current = s + this.specialNames[place] + current;
            }

            place++;

            number = Maths.integer(number / 1000);
        } while (number > 0);

        return (prefix + current).trim();
    }
}

class Maths {
    static integer(n) {
        return n < 0 ? Math.ceil(n) : Math.floor(n);
    }
}

async function main() {
    const args = new Args();
    const argVersion = args.parse('version', 'v', 'boolean', false),
        argHelp = args.parse('help', 'h', 'boolean', false),
        argIndian = args.parse('indian', 'i', 'number', null),
        argWestern = args.parse('western', 'w', 'number', null);

    if (argHelp) {
        console.log(`${APPNAME}
A command-line app to convert a given number into words using Indian or western numbering system.

Usage: n2w [options] []

Options:
    -h, --help       display the help menu
    -v, --version    display the application version
    -i, --indian     converts in Indian numbering system
    -w, --western    converts in Western numbering system

Examples: 
    n2w -i 12345
    n2w -w 12345
`);
    } else if (argVersion) {
        console.log(`${APPNAME} (Version ${APPVER})
Copyright (c) 2020 Abhishek Kumar.
Licensed under the MIT License.
`);
    } else if (!!argIndian) {
        let indianSystem = new IndianSystem();
        console.log(indianSystem.convert(argIndian));
    } else if (!!argWestern) {
        let westernSystem = new WesternSystem();
        console.log(westernSystem.convert(argWestern));
    } else {
        console.log('Invalid or missing arguments');
    }
}

main();