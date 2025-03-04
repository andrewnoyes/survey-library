import React from "react";
import { SurveyElementCore, doKey2ClickUp } from "survey-core";
import { TitleActions } from "./title-actions";

export class TitleElement extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }
  private get element(): SurveyElementCore {
    return this.props.element;
  }
  render(): JSX.Element {
    const element = this.element;
    if(!element || !element.hasTitle) return null;
    const titleContent = <TitleActions element={element} cssClasses={element.cssClasses}></TitleActions>;
    let onClick = null;
    let onKeyUp = null;
    if (element.hasTitleEvents) {
      onClick = () => {
        return element.toggleState();
      };
      onKeyUp = (evt: any) => {
        doKey2ClickUp(evt.nativeEvent);
      };
    }

    const CustomTag = element.titleTagName as keyof JSX.IntrinsicElements;
    return (
      <CustomTag
        className={element.cssTitle}
        aria-label={element.locTitle.renderedHtml}
        id={element.ariaTitleId}
        tabIndex={element.titleTabIndex}
        aria-expanded={element.titleAriaExpanded}
        onClick={onClick}
        onKeyUp={onKeyUp}
      >
        {titleContent}
      </CustomTag>
    );
  }
}
