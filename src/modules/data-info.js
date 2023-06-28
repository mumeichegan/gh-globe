import imagePrIcon from '../assets/pull-request-icon.svg'

export default class DataInfo {
    constructor(props) {
        this.props = props
        this.init()
        this.cardOffset = {
            x: 10,
            y: 16
        }
    }
    init() {
        this.isVisible = false
        this.element = createElement(
            'div',
            ['data-info'],
            `
            <a href="#" class='card'>
                <div>
                    <img src='${imagePrIcon}' loading='lazy'>
                </div>
                <div>
                    <div class='card-header'></div>
                    <div style='color: #959da5' class='card-body'></div>
                </div>
            </a>
            `
        )
        
        document.body.appendChild(this.element);

        this.card = this.element.querySelector('.card');
        this.cardHeader = this.card.querySelector('.card-header');
        this.cardBody = this.card.querySelector('.card-body');
        
    }

    update(mouseScreenPos, offset) {
        const targetX = mouseScreenPos.x + offset.x + this.cardOffset.x;
        const targetY = mouseScreenPos.y + offset.y + this.cardOffset.y;
        const cardRect = this.element.getBoundingClientRect();
        const newX = Math.min(targetX, window.innerWidth - cardRect.width - this.cardOffset.x);
        const bottomEdge = targetY + cardRect.height;
        const aboveCursor = mouseScreenPos.y - cardRect.height - this.cardOffset.y / 2 + offset.y;
        const newY = bottomEdge > window.innerHeight + offset.y ? aboveCursor : targetY;
        this.element.style.transform = `translate(${newX}px, ${newY}px)`;
    }

    show() {
        const { controls } = this.props;
        this.element.style.display = 'block'
        controls.autoRotationSpeedScalarTarget = 0;
        this.isVisible = true;
    }
    
    hide() {
        const { controls } = this.props;
        this.element.style.display = 'none'
        controls.autoRotationSpeedScalarTarget = 1;
        this.isVisible = false;
    }

    setInfo(info) {
        const { 
            user_opened_location, 
            user_merged_location, 
            language, 
            type, 
            name_with_owner, 
            pr_id
        } = info;

        const prHeader = `#${pr_id} ${name_with_owner}`;

        if (type === 'PR_MERGED') {
            this.cardHeader.textContent = prHeader;
            this.cardBody.textContent = '';
            this.cardBody.insertAdjacentHTML('beforeend', `Opened in ${user_opened_location},\nmerged in ${user_merged_location}`);
            if (language !== null) this.cardBody.prepend(language, this.colorDotForLanguage(language));
        } 
        else if (type === 'PR_OPENED') {
            this.cardHeader.textContent = prHeader;
            this.cardBody.textContent = '';
            this.cardBody.insertAdjacentHTML('beforeend', `Opened in ${user_opened_location}`);
            if (language !== null) this.cardBody.prepend(language, this.colorDotForLanguage(language));
        } 
    }

    colorDotForLanguage(language) {
        const languageDot = document.createElement("span");
        languageDot.style.color = this.colorForLanguage(language);
        languageDot.textContent = " • ";
        return languageDot;
    }

    colorForLanguage(language) {
        const colors = {
            "ActionScript": "#882B0F",
            "AMPL": "#E6EFBB",
            "API Blueprint": "#2ACCA8",
            "Apollo Guidance Computer": "#0B3D91",
            "AppleScript": "#101F1F",
            "Arc": "#aa2afe",
            "ASP.NET": "#9400ff",
            "Assembly": "#6E4C13",
            "Batchfile": "#C1F12E",
            "C": "#555555",
            "C#": "#178600",
            "C++": "#f34b7d",
            "Clojure": "#db5855",
            "CoffeeScript": "#244776",
            "ColdFusion": "#ed2cd6",
            "ColdFusion CFC": "#ed2cd6",
            "Common Lisp": "#3fb68b",
            "Component Pascal": "#B0CE4E",
            "Crystal": "#000100",
            "CSON": "#244776",
            "CSS": "#563d7c",
            "Dart": "#00B4AB",
            "Dockerfile": "#384d54",
            "EJS": "#a91e50",
            "Elixir": "#6e4a7e",
            "Elm": "#60B5CC",
            "Emacs Lisp": "#c065db",
            "EmberScript": "#FFF4F3",
            "EQ": "#a78649",
            "Erlang": "#B83998",
            "Game Maker Language": "#71b417",
            "GAML": "#FFC766",
            "Glyph": "#c1ac7f",
            "Go": "#00ADD8",
            "GraphQL": "#e10098",
            "Haml": "#ece2a9",
            "Handlebars": "#f7931e",
            "Harbour": "#0e60e3",
            "Haskell": "#5e5086",
            "HTML": "#e34c26",
            "J": "#9EEDFF",
            "Java": "#b07219",
            "JavaScript": "#f1e05a",
            "Julia": "#a270ba",
            "Kotlin": "#F18E33",
            "Less": "#1d365d",
            "Lex": "#DBCA00",
            "LLVM": "#185619",
            "Lua": "#000080",
            "Makefile": "#427819",
            "Markdown": "#083fa1",
            "MATLAB": "#e16737",
            "Mercury": "#ff2b2b",
            "Metal": "#8f14e9",
            "Nim": "#ffc200",
            "Nix": "#7e7eff",
            "NumPy": "#9C8AF9",
            "Objective-C": "#438eff",
            "Objective-C++": "#6866fb",
            "Pan": "#cc0000",
            "Pascal": "#E3F171",
            "Pawn": "#dbb284",
            "Perl": "#0298c3",
            "PHP": "#4F5D95",
            "PLSQL": "#dad8d8",
            "PostScript": "#da291c",
            "PowerBuilder": "#8f0f8d",
            "PowerShell": "#012456",
            "Prisma": "#0c344b",
            "Processing": "#0096D8",
            "Puppet": "#302B6D",
            "Python": "#3572A5",
            "R": "#198CE7",
            "Reason": "#ff5847",
            "Ruby": "#701516",
            "Rust": "#dea584",
            "Sass": "#a53b70",
            "Scala": "#c22d40",
            "Scheme": "#1e4aec",
            "SCSS": "#c6538c",
            "Shell": "#89e051",
            "Svelte": "#ff3e00",
            "SVG": "#ff9900",
            "Swift": "#ffac45",
            "TI Program": "#A0AA87",
            "Turing": "#cf142b",
            "Twig": "#c1d026",
            "TypeScript": "#2b7489",
            "Uno": "#9933cc",
            "UnrealScript": "#a54c4d",
            "Vala": "#fbe5cd",
            "Vim script": "#199f4b",
            "Visual Basic .NET": "#945db7",
            "Vue": "#41586f",
            "wdl": "#42f1f4",
            "WebAssembly": "#04133b",
            "YAML": "#cb171e"
        }
    
        return colors[language];
    }
}

function createElement(type, classNames, content) {
    type = type || 'div';
    const el = document.createElement(type);
    if (classNames) {
        classNames.forEach((name) => {
            el.classList.add(name);
        });
    }
    if (content) {
        el.innerHTML = content;
    } 
    return el;
}