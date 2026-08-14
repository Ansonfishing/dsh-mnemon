import { createContext, useContext } from 'react';
import sidebarCss from './MnemonSidebarView.module.css';
const buildinAppearance = {
    surface: 'buildin',
    title: 'Mnemon',
    showLogo: true,
    showTelemetry: true,
    showNavigationGlyphs: true,
    showNavigationDetails: true,
    showNavigationDividers: true,
    showSpaceSummary: true,
    classes: {},
};
/** Appearance is a surface concern; every data flow and workspace action stays shared. */
export function resolveMnemonViewAppearance(surface, t) {
    if (surface === 'buildin')
        return buildinAppearance;
    return {
        surface: 'sidebar',
        title: t('tab.label'),
        showLogo: false,
        showTelemetry: false,
        showNavigationGlyphs: false,
        showNavigationDetails: false,
        showNavigationDividers: false,
        showSpaceSummary: false,
        classes: {
            shell: sidebarCss.shell,
            masthead: sidebarCss.masthead,
            brand: sidebarCss.brand,
            headerActions: sidebarCss.headerActions,
            workspacePicker: sidebarCss.workspacePicker,
            statusCluster: sidebarCss.statusCluster,
            workspaceMismatch: sidebarCss.workspaceMismatch,
            topNavigation: sidebarCss.topNavigation,
            nav: sidebarCss.nav,
            navGroup: sidebarCss.navGroup,
            memoryNavigation: sidebarCss.memoryNavigation,
            memoryTabs: sidebarCss.memoryTabs,
            memoryWriteButton: sidebarCss.memoryWriteButton,
            modalBackdrop: sidebarCss.modalBackdrop,
            modal: sidebarCss.modal,
            canvas: sidebarCss.canvas,
            pageHeader: sidebarCss.pageHeader,
            inspectorGlyph: sidebarCss.inspectorGlyph,
        },
    };
}
const AppearanceContext = createContext(buildinAppearance);
export const MnemonViewAppearanceProvider = AppearanceContext.Provider;
export function useMnemonViewAppearance() {
    return useContext(AppearanceContext);
}
export function appearanceClass(base, variant) {
    return [base, variant].filter((value) => value !== undefined && value !== '').join(' ');
}
//# sourceMappingURL=MnemonViewAppearance.js.map