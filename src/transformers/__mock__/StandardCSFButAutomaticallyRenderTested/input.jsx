var _excluded = ["components"];
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function(sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function(key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import React from "react";
import { mdx } from "@mdx-js/react";

/* @jsxRuntime classic */
/* @jsx mdx */
import { assertIsFn, AddContext } from "@storybook/addon-docs";
import { Canvas, Meta, Story, DocsContext } from "@storybook/addon-docs";
import { Button, Title } from "stories";
var layoutProps = {};
var MDXLayout = "wrapper";
function MDXContent(_ref) {
  var components = _ref.components,
    props = _objectWithoutProperties(_ref, _excluded);
  return mdx(MDXLayout, _extends({}, layoutProps, props, {
    components: components,
    mdxType: "MDXLayout"
  }), mdx(Meta, {
    component: Button,
    id: "mdx-mdxautomatictestfileformats-standard-csf",
    mdxType: "Meta"
  }), mdx(Title, {
    mdxType: "Title"
  }), mdx("p", null, "Simply check if the component renders okay without extra cypress assertions"), mdx(Story, {
    name: "StandardCSFButAutomaticallyRenderTested",
    args: {
      label: "CSF"
    },
    mdxType: "Story"
  }, function(args) {
    return mdx(Button, _extends({}, args, {
      mdxType: "Button"
    }));
  }));
}

MDXContent.isMDXComponent = true;
export var standardCsfButAutomaticallyRenderTested = function standardCsfButAutomaticallyRenderTested(args) {
  return mdx(Button, args);
};
standardCsfButAutomaticallyRenderTested.storyName = "StandardCSFButAutomaticallyRenderTested";
standardCsfButAutomaticallyRenderTested.args = {
  label: "CSF"
};
standardCsfButAutomaticallyRenderTested.parameters = {
  storySource: {
    source: "args => <Button {...args} />"
  }
};
var componentMeta = {
  id: "mdx-mdxautomatictestfileformats-standard-csf",
  component: Button,
  includeStories: ["standardCsfButAutomaticallyRenderTested"]
};
var mdxStoryNameToKey = {
  "StandardCSFButAutomaticallyRenderTested": "standardCsfButAutomaticallyRenderTested"
};
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
