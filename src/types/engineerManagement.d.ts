interface IBaseNavigatorMenu {
    label: string;
    selected: Array<string>;
    change: (selected: string[]) => void;
    img?: string;
    isExpand?: boolean;
    multible?: boolean;
    children?: Omit<IBaseNavigatorMenu, 'selected' | 'change'>[];
}
