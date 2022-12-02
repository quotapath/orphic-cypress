var _excluded = ["components"];
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function(sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function(key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import React from 'react';
import { mdx } from '@mdx-js/react';

/* @jsxRuntime classic */
/* @jsx mdx */
import { assertIsFn, AddContext } from "@storybook/addon-docs";
import { Meta } from "@storybook/addon-docs";
var layoutProps = {};
var MDXLayout = "wrapper";
function MDXContent(_ref) {
  var components = _ref.components,
    props = _objectWithoutProperties(_ref, _excluded);
  return mdx(MDXLayout, _extends({}, layoutProps, props, {
    components: components,
    mdxType: "MDXLayout"
  }), mdx(Meta, {
    mdxType: "Meta"
  }), mdx("h1", null, "Selecting stories with .cyOnly"), mdx("p", null, mdx("inlineCode", {
    parentName: "p"
  }, "cyOnly"), " property on either the default export or individual stories effectively\ncalls the cypress test with ", mdx("inlineCode", {
    parentName: "p"
  }, "describe.only"), " or ", mdx("inlineCode", {
    parentName: "p"
  }, "it.only"), ", restively."), mdx("p", null, "That should be used with caution of course, e.g. actually including something\nlike these tests would effectively narrow down which tests were running in a major way,\nespecially in the non-isolated, 'mount' test."), mdx("pre", null, mdx("code", {
    parentName: "pre",
    "className": "language-ts"
  }, "export default { component: Button };\n\nexport const NotSkippedFunction: ComponentStoryCy<typeof Button> = (args) => (\n  <Button {...args} label=\"Story function\" />\n);\n\nNotSkippedFunction.cy = () =>\n  cy.dataCy(\"button\").should(\"contain\", \"Story function\");\n\nNotSkippedFunction.cyOnly = true;\n\nexport const SkippedFunction: ComponentStoryCy<typeof Button> = (args) => (\n  <Button {...args} label=\"Story function\" />\n);\n\nSkippedFunction.cy = () =>\n  cy.dataCy(\"button\").should(\"contain\", \"Would fail if not skipped\");\n\nexport const NotSkippedObject = {\n  args: { label: \"Another\" },\n  cy: () => cy.dataCy(\"button\").should(\"contain\", \"Another\"),\n  cyOnly: true,\n};\n\nexport const SkippedObject = {\n  args: { label: \"Another\" },\n  cy: () => cy.dataCy(\"button\").should(\"contain\", \"Would fail if not skipped\"),\n};\n")));
}
;
MDXContent.isMDXComponent = true;
export var __page = function __page() {
  throw new Error("Docs-only story");
};
__page.parameters = {
  docsOnly: true
};
var componentMeta = {
  includeStories: ["__page"]
};
var mdxStoryNameToKey = {};
componentMeta.parameters = componentMeta.parameters || {};
componentMeta.parameters.docs = _objectSpread(_objectSpread({}, componentMeta.parameters.docs || {}), {}, {
  page: function page() {
    return mdx(AddContext, {
      mdxStoryNameToKey: mdxStoryNameToKey,
      mdxComponentAnnotations: componentMeta
    }, mdx(MDXContent, null));
  }
});
export default componentMeta;
