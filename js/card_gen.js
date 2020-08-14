
function updateForm(form) {
    if (form.type == "reset") {
        for (element of document.getElementsByClassName("hidden")) {
            element.style.display = "none";
        }
        app.card = new Card();
        return;
    }

    if (form.parentElement.classList.contains("branches")) {
        for (child of form.parentElement.children) {
            if (child.classList.contains("hidden")) child.style.display = "none";
        }
        selected = form.selectedOptions[0].value;
        document.getElementById(selected).style.display = "block";
    }

    app.card.set(field, value);
}

class Trigger {
    constructor() {
        this.type = "";

        this.toString = function () {
            switch (this.type) {
                case "":
                    return "";
                case "per turn":
                    return " per turn";
                case "next turn":
                    return " next turn";
                case "resource consumed":
                    return "";
                default:
                    console.log("Unsupported trigger type " + this.type);
                    return "";
            }
        }

        this.set = function (string) {
            var path = string.split(".");
            switch (path[0]) {
                case "Type":
                    this.type = path[1];
                    break;
                default:
                    console.log("Unsupported input \"" + string + "\"");
            }
        }
    }
}

class Resource {
    constructor() {
        this.type = "";
        this.resource = "";
        this.resourceB = "";
        this.amount = 1;
        this.ratio = [1,1];

        this.toString = function () {
            switch (this.type) {
                case "":
                    return "";
                case "generate":
                    return "Generates " + this.amount + " " + this.resource;
                case "consume":
                    return "Consumes " + this.amount + " " + this.resource;
                case "convert":
                    return "Converts " + this.resource + " into " + this.resourceB + " at a ratio of " + this.ratio[0] + ":" + this.ratio[1];
                default:
                    console.log("Unsupported input \"" + string + "\"");
                    return "";
            }
        }

        this.set = function (string) {
            var path = string.split(".");
            switch (path[0]) {
                case "Interaction":
                    this.type = path[1];
                    break;
                case "Resource":
                    this.resource = path[1];
                    break;
                default:
                    if (!isNaN(path[0])) {
                        this.amount = +path[0];
                        return;
                    }
                    console.log("Unsupported input \"" + string + "\"");
            }
        }
    }
}

class Operation {
    constructor() {
        this.type = "";

        this.set = function (string) {
            var path = string.split(".");
            switch (path[0]) {
                case "Operation":
                    this.type = path[0];
                    break;
                default:
                    if (!isNaN(path[0])) {
                        this.amount = +path[0];
                        return;
                    }
                    console.log("Unsupported input \"" + string + "\"");
                    return "";
            }
        }
    }
}

class Target {
    constructor() {
        this.type = "";
        this.target = "";
        this.stat = "";

        this.set = function (string) {
            var path = string.split(".");
            switch (path[0]) {
                case "Target":
                    this.type = "target";
                    this.target = path[1];
                case "Stat":
                    this.type = "stat";
                    this.stat = path[1];
                    break;
                default:
                    console.log("Unsupported input \"" + string + "\"");
                    return "";
            }
        }
    }
}

class Constraint {
    constructor() {
        this.type = "";
        this.target_limit = "";
        this.consumes = "";

        this.set = function (string) {
            var path = string.split(".");
            switch (path[0]) {
                case "Constraint":
                    this.type = path[1];
                    break;
                case "Target limit":
                    this.target_limit = path[2];
                    break;
                case "Consumes":
                    this.consumes = path[2];
                    break;
                default:
                    console.log("Unsupported input \"" + string + "\"");
                    return "";
            }
        }
    }
}

class Card {
    constructor() {
        this.title = "";
        this.text = "";
        this.type = "";

        this.trigger = new Trigger();
        this.resource = new Resource();
        this.operation = new Operation();
        this.target = new Target();
        this.constraint = new Constraint();

        this.set = function (string) {
            var path = string.split(".");
            switch (path[0]) {
                case "Type":
                    this.type = path[1]
                    break;
                case "Resource":
                    this.resource.set(string.substring(string.indexOf(".") + 1));
                    break;
                case "Trigger":
                    this.trigger.set(string.substring(string.indexOf(".") + 1));
                    break;
                case "Constraint":
                    this.constraint.set(string.substring(string.indexOf(".") + 1));
                    break;
                case "Operation":
                    this.operation.set(string.substring(string.indexOf(".") + 1));
                    break;
                case "Target":
                    this.target.set(string.substring(string.indexOf(".") + 1));
                    break;
                default:
                    console.log("Unsupported input \"" + string + "\"");
            }
            this.text = this.toString();
        }

        this.toString = function() {
            if (this.type == "active") {
                return this.resource.toString() + this.trigger.toString();
            } else if (this.type == "passive") {

            } else if (this.type == "meta") {

            }
        }
    }
}

Vue.component('card', {
    props: ['card'],
    template: `<div id="card-container">
                 <div id="card" class="big-card" v-bind:class="card.type" style="display:inline-block">
                   <div class="aspect-ratio"></div>
                   <div class="grid">
                     <div class="title">
                       {{ card.title }}
                     </div>
                     <div class="image">
                     </div>
                     <div class="text">
                       {{ card.text }}
                     </div>
                   </div>
                 </div>
               </div>`
});

Vue.component('form-branch', {
    props: ['form'],
    methods: {
        onPropagate: function (path) {
            this.$emit('propagate', path);
        }
    },
    template: `<div>
                 <fieldset v-if="form.title">
                   <legend>{{ form.title }}</legend>
                   <component
                     v-for="field in form.fields"
                     v-bind:is="field.is"
                     v-bind:form="field"
                     @propagate="onPropagate"
                   >
                   </component>
                 </fieldset>
               </div>`
});

Vue.component('form-select', {
    props: ['form'],
    methods: {
        log: function (event) {
            console.log(event.target);
        }
    },
    template: `<div>
                 <label v-bind:for="form.title">{{ form.title }}</label><br>
                 <select v-bind:name="form.title"
                         v-model="form.value"
                         v-bind:key="Math.random()"
                         @input="$emit('propagate', $event.target.name + '.' + $event.target.value)">
                   <option v-for="option in form.options" v-bind:value="option.value">
                     {{ option.text }}
                   </option>
                 </select>
                 <br>
                 <form-branch
                   @propagate="form.onPropagate"
                   v-for="field in form.branches[form.value]"
                   v-bind:form="field">
                 </form-branch>
               </div>`
});

Vue.component('form-number', {
    props: ['form'],
    template: `<div>
                 <label v-bind:for="form.title">{{ form.title }}</label><br>
                 <input v-bind:name="form.title"
                        v-bind:key="Math.random()"
                        type="number"
                        min="1"
                        v-model="form.value"
                        v-on:input="$emit('propagate', $event.target.value)"
                 ></input>
              </div>`
});

class form_number_input {
    constructor() {
        this.is = "form-number";
        this.title = "Number";
        this.value = 1;
        this.onPropagate = function (path) {
            this.$emit('propagate', this.field.title + "." + path);
        };
    }
}

class form_resource_type {
    constructor() {
        this.is = "form-select";
        this.title = "Resource";
        this.value = "";
        this.options = [
            {value: "", text: ""},
            {value: "booster pack", text: "booster packs"},
            {value: "mana", text: "mana"},
        ];
        this.branches = {};
        this.onPropagate = function (path) {
            this.$emit('propagate', this.field.title + "." + path);
        };
    }
}

class form_trigger {
    constructor() {
        this.title = "Trigger";
        this.fields = [
            {
                is: "form-select",
                title: "Type",
                value: "",
                options: [
                    {value: "", text: ""},
                    {value: "per turn", text: "...per turn"},
                    {value: "next turn", text: "...next turn"},
                ],
                branches: {},
                onPropagate: function (path) {
                    this.$emit('propagate', this.field.title + "." + path);
                },
            }
        ];
        this.onPropagate = function (path) {
            this.$emit('propagate', path);
        };
    }
}

class form_resource {
    constructor() {
        this.title = "Resource";
        this.fields = [
            {
                is: "form-select",
                title: "Interaction",
                value: "",
                options: [
                    {value: "", text: ""},
                    {value: "generate", text: "Generates..."},
                    {value: "consume", text: "Consumes..."},
                    {value: "convert", text: "Converts..."},
                ],
                branches: {},
                onPropagate: function (path) {
                    this.$emit('propagate', this.field.title + "." + path);
                },
            },
            new form_number_input(),
            new form_resource_type(),
        ];
        this.onPropagate = function (path) {
            this.$emit('propagate', path);
        };
    }
}

class form_constraint {
    constructor() {
        this.title = "Constraint";
        this.fields = [
            {
                is: "form-select",
                title: "Constraint",
                value: "",
                options: [
                    {value: "", text: ""},
                    {value: "up to", text: "...up to..."},
                    {value: "consumes", text: "...if it consumes..."},
                    {value: "target limit", text: "Can't target ... cards."},
                ],
                branches: {
                    "consumes": [{title: "Consumes", fields: [new form_resource_type()]}],
                    "target limit": [{title: "Target limit", fields: [{
                        is: "form-select",
                        title: "Card tag",
                        value: "",
                        options: [
                            {value: "", text: ""},
                            {value: "mana", text: "...mana..."},
                        ],
                        branches: {},
                        onPropagate: function (path) {
                            this.$emit('propagate', this.field.title + "." + path);
                        },
                    }]}]
                },
                onPropagate: function (path) {
                    this.$emit('propagate', this.field.title + "." + path);
                },
            }
        ];
        this.onPropagate = function (path) {
            this.$emit('propagate', path);
        };
    }
}

class form_operation {
    constructor() {
        this.title = "Operation";
        this.fields = [
            {
                is: "form-select",
                title: "Operation",
                value: "",
                options: [
                    {value: "", text: ""},
                    {value: "set", text: "Set ... to..."},
                    {value: "increase", text: "Increase ... by..."},
                    {value: "decrease", text: "Decrease ... by..."},
                    {value: "multiply", text: "Multiply ... by..."},
                    {value: "divide", text: "Divide ... by..."},
                    {value: "exponent", text: "Power up ... by..."},
                ],
                branches: {},
                onPropagate: function (path) {
                    this.$emit('propagate', this.field.title + "." + path);
                },
            },
            new form_number_input()
        ];
        this.onPropagate = function (path) {
            this.$emit('propagate', path);
        };
    }
}

class form_target_passive {
    constructor() {
        this.title = "Target";
        this.fields = [
            {
                is: "form-select",
                title: "Stat",
                value: "",
                options: [
                    {value: "", text: ""},
                    {value: "number", text: "...the number on..."},
                    {value: "effect", text: "...the effect of..."},
                    {value: "speed", text: "...the amount of times ... activates per turn..."},
                    {value: "cost", text: "...the resource cost..."},
                ],
                branches: {},
                onPropagate: function (path) {
                    this.$emit('propagate', this.field.title + "." + path);
                },
            },
            {
                is: "form-select",
                title: "Target",
                value: "",
                options: [
                    {value: "", text: ""},
                    {value: "next", text: "...the next card..."},
                    {value: "all", text: "...all following cards..."},
                ],
                branches: {},
                onPropagate: function (path) {
                    this.$emit('propagate', this.field.title + "." + path);
                },
            }
        ];
        this.onPropagate = function (path) {
            this.$emit('propagate', path);
        };
    }
}

class form_target_meta {
    constructor() {
        this.title = "Target";
        this.fields = [
            {
                is: "form-select",
                title: "Stat",
                value: "",
                options: [
                    {value: "", text: ""},
                    {value: "hand size", text: "...hand size..."},
                    {value: "turn speed", text: "...the amount of turns per second..."},
                    {value: "card rarity", text: "...rarity of cards recieved from booster packs..."},
                    {value: "pack size", text: "...the amount of cards in each booster pack..."},
                ],
                branches: {},
                onPropagate: function (path) {
                    this.$emit('propagate', this.field.title + "." + path);
                },
            }
        ];
        this.onPropagate = function (path) {
            this.$emit('propagate', path);
        };
    }
}

class form_type {
    constructor() {
        this.is = "form-select";
        this.title = "Type";
        this.value = "";
        this.options = [
            {value: "", text: ""},
            {value: "active", text: "Active"},
            {value: "passive", text: "Passive"},
            {value: "meta", text: "Meta"}
        ];
        this.branches = {
            active: [new form_resource(), new form_trigger(), new form_constraint()],
            passive: [new form_operation(), new form_target_passive()],
            meta: [new form_operation(), new form_target_meta()]
        };
        this.onPropagate = function (path) {
            this.$emit('propagate', this.field.title + "." + path);
        };
    }
};

var form = {
    title: "Card",
    fields: [new form_type()]
};

var app = new Vue({
    el: "#container",
    data: {
        card: new Card(),
        form: [form]
    },
    methods: {
        onPropagate: function (value) {
            app.card.set(value)
        }
    }
});
