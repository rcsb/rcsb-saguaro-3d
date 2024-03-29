declare module '*.module.css';
declare module '*.module.scss';
declare module '*.module.sass';
declare module "*.json" {
    const value: any;
    export default value;
}

declare module "boxicons/*.svg" {
    import {SVGProps} from "react";
    const content: React.FC<SVGProps<any>>;
    export default content;
}
