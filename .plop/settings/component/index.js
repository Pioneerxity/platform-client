module.exports = {
  description: "Creates a new component",
  prompts: [
    {
      type: "list",
      name: "componentType",
      message: "What component do you want to create?",
      choices: ["common", "layout", "page", "ui", "icon"],
    },
    {
      type: "input",
      name: "name",
      message: "What is the name of the component?",
    },
  ],
  actions: [
    // index.ts
    {
      type: "add",
      path: "../src/components/{{componentType}}/{{name}}/index.ts",
      templateFile: "templates/component/index.ts.hbs",
    },
    // component container
    {
      type: "add",
      path: "../src/components/{{componentType}}/{{name}}/{{name}}.tsx",
      templateFile: "templates/component/component.tsx.hbs",
    },
    // component view
    {
      type: "add",
      path: "../src/components/{{componentType}}/{{name}}/{{name}}.view.tsx",
      templateFile: "templates/component/component.view.tsx.hbs",
    },
    // component view
    {
      type: "add",
      path: "../src/components/{{componentType}}/{{name}}/{{name}}.props.ts",
      templateFile: "templates/component/component.props.ts.hbs",
    },
    // // storybook
    // {
    //   type: "add",
    //   path: "../src/components/{{componentType}}/{{name}}/{{name}}.stories.tsx",
    //   templateFile: "templates/component/stories.tsx.hbs",
    // },
  ],
};

// // tests
// {
//   type: 'add',
//   path: '../src/components/{{componentType}}/{{pascalCase name}}/{{pascalCase name}}.test.tsx',
//   templateFile: 'templates/component/test.tsx.hbs'
// }
