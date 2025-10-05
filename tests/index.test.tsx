import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import React, {type PropsWithChildren} from 'react';
import {hasSlots, Slot, Template} from '../src';

describe('React Slot System', () => {
    describe('hasSlots HOC', () => {
        it('should enhance component with slot functionality', () => {
            const BaseComponent = ({title, children}: PropsWithChildren<{ title: string }>) => (
                <div>
                    <h1>{title}</h1>
                    <Slot name="content"/>
                    {children}
                </div>
            );

            const EnhancedComponent = hasSlots(BaseComponent);

            render(
                <EnhancedComponent title="Test Title">
                    <Template slot="content">
                        <p>Slot content</p>
                    </Template>
                </EnhancedComponent>
            );

            expect(screen.getByText('Test Title')).not.toBeNull();
            expect(screen.getByText('Slot content')).not.toBeNull();
        });

        it('should preserve original component props', () => {
            interface Props {
                title: string;
                subtitle?: string;
                count: number;
            }

            const BaseComponent = ({title, subtitle, count, children}: PropsWithChildren<Props>) => (
                <div>
                    <h1>{title}</h1>
                    {subtitle && <h2>{subtitle}</h2>}
                    <span>Count: {count}</span>
                    <Slot name="content"/>
                    {children}
                </div>
            );

            const EnhancedComponent = hasSlots(BaseComponent);

            render(
                <EnhancedComponent title="Main Title" subtitle="Sub Title" count={42}>
                    <Template slot="content">
                        <p>Content here</p>
                    </Template>
                </EnhancedComponent>
            );

            expect(screen.getByText('Main Title')).not.toBeNull();
            expect(screen.getByText('Sub Title')).not.toBeNull();
            expect(screen.getByText('Count: 42')).not.toBeNull();
            expect(screen.getByText('Content here')).not.toBeNull();
        });
    });

    describe('Slot component', () => {
        const TestComponent = hasSlots(({children}: { children?: React.ReactNode }) => (
            <div>
                <Slot name="header"/>
                <div className="main">{children}</div>
                <Slot name="footer"/>
            </div>
        ));

        it('should render slot content when template is provided', () => {
            render(
                <TestComponent>
                    <Template slot="header">
                        <h1>Header Content</h1>
                    </Template>
                    <p>Main content</p>
                </TestComponent>
            );

            expect(screen.getByText('Header Content')).not.toBeNull();
            expect(screen.getByText('Main content')).not.toBeNull();
        });

        it('should render nothing when no template is provided and no fallback', () => {
            render(
                <TestComponent>
                    <p>Main content</p>
                </TestComponent>
            );

            expect(screen.getByText('Main content')).not.toBeNull();
        });

        it('should render fallback content when no template is provided', () => {
            const ComponentWithFallback = hasSlots(({children}: { children?: React.ReactNode }) => (
                <div>
                    <Slot name="header" fallback={<h1>Default Header</h1>}/>
                    <Slot name="footer" fallback={<p>Default Footer</p>}/>
                    {children}
                </div>
            ));

            render(<ComponentWithFallback/>);

            expect(screen.getByText('Default Header')).not.toBeNull();
            expect(screen.getByText('Default Footer')).not.toBeNull();
        });

        it('should prioritize template content over fallback', () => {
            const ComponentWithFallback = hasSlots(({children}: { children?: React.ReactNode }) => (
                <div>
                    <Slot name="header" fallback={<h1>Default Header</h1>}/>
                    {children}
                </div>
            ));

            render(
                <ComponentWithFallback>
                    <Template slot="header">
                        <h1>Custom Header</h1>
                    </Template>
                </ComponentWithFallback>
            );

            expect(screen.getByText('Custom Header')).not.toBeNull();
            expect(screen.queryByText('Default Header')).toBeNull();
        });

        it('should handle multiple slots with different content', () => {
            const MultiSlotComponent = hasSlots(({children}: { children?: React.ReactNode }) => (
                <div>
                    <Slot name="header"/>
                    <Slot name="sidebar"/>
                    <Slot name="footer"/>
                    {children}
                </div>
            ));

            render(
                <MultiSlotComponent>
                    <Template slot="header">
                        <h1>Page Header</h1>
                    </Template>
                    <Template slot="sidebar">
                        <nav>Navigation</nav>
                    </Template>
                    <Template slot="footer">
                        <footer>Page Footer</footer>
                    </Template>
                </MultiSlotComponent>
            );

            expect(screen.getByText('Page Header')).not.toBeNull();
            expect(screen.getByText('Navigation')).not.toBeNull();
            expect(screen.getByText('Page Footer')).not.toBeNull();
        });
    });

    describe('Template component', () => {
        it('should not render directly but provide content to slots', () => {
            const {container} = render(
                <Template slot="test">
                    <p>Template content</p>
                </Template>
            );

            // Template should not render anything directly
            expect(container.firstChild).toBeNull();
        });

        it('should handle complex JSX content', () => {
            const ComplexComponent = hasSlots(({children}: { children?: React.ReactNode }) => (
                <div>
                    <Slot name="complex"/>
                    {children}
                </div>
            ));

            render(
                <ComplexComponent>
                    <Template slot="complex">
                        <div>
                            <h2>Complex Content</h2>
                            <ul>
                                <li>Item 1</li>
                                <li>Item 2</li>
                            </ul>
                            <button onClick={() => {
                            }}>Click me
                            </button>
                        </div>
                    </Template>
                </ComplexComponent>
            );

            expect(screen.getByText('Complex Content')).not.toBeNull();
            expect(screen.getByText('Item 1')).not.toBeNull();
            expect(screen.getByText('Item 2')).not.toBeNull();
            expect(screen.getByText('Click me')).not.toBeNull();
        });

        it('should handle multiple templates for different slots', () => {
            const MultiTemplateComponent = hasSlots(({children}: { children?: React.ReactNode }) => (
                <div>
                    <Slot name="first"/>
                    <Slot name="second"/>
                    <Slot name="third"/>
                    {children}
                </div>
            ));

            render(
                <MultiTemplateComponent>
                    <Template slot="first">
                        <span>First slot</span>
                    </Template>
                    <Template slot="second">
                        <span>Second slot</span>
                    </Template>
                    <Template slot="third">
                        <span>Third slot</span>
                    </Template>
                </MultiTemplateComponent>
            );

            expect(screen.getByText('First slot')).not.toBeNull();
            expect(screen.getByText('Second slot')).not.toBeNull();
            expect(screen.getByText('Third slot')).not.toBeNull();
        });

        it('should handle template override (last template wins)', () => {
            const OverrideComponent = hasSlots(({children}: { children?: React.ReactNode }) => (
                <div>
                    <Slot name="content"/>
                    {children}
                </div>
            ));

            render(
                <OverrideComponent>
                    <Template slot="content">
                        <span>First template</span>
                    </Template>
                    <Template slot="content">
                        <span>Second template</span>
                    </Template>
                </OverrideComponent>
            );

            expect(screen.queryByText('First template')).toBeNull();
            expect(screen.getByText('Second template')).not.toBeNull();
        });
    });

    describe('Integration scenarios', () => {
        it('should work with nested components', () => {
            const InnerComponent = hasSlots(({children}: { children?: React.ReactNode }) => (
                <div className="inner">
                    <Slot name="inner-content"/>
                    {children}
                </div>
            ));

            const OuterComponent = hasSlots(({children}: { children?: React.ReactNode }) => (
                <div className="outer">
                    <Slot name="outer-header"/>
                    <InnerComponent>
                        <Template slot="inner-content">
                            <p>Inner content</p>
                        </Template>
                    </InnerComponent>
                    <Slot name="outer-footer"/>
                    {children}
                </div>
            ));

            render(
                <OuterComponent>
                    <Template slot="outer-header">
                        <h1>Outer Header</h1>
                    </Template>
                    <Template slot="outer-footer">
                        <footer>Outer Footer</footer>
                    </Template>
                </OuterComponent>
            );

            expect(screen.getByText('Outer Header')).not.toBeNull();
            expect(screen.getByText('Inner content')).not.toBeNull();
            expect(screen.getByText('Outer Footer')).not.toBeNull();
        });

        it('should work with conditional rendering', () => {
            const ConditionalComponent = hasSlots(({showHeader, children}: PropsWithChildren<{ showHeader: boolean }>) => (
                <div>
                    {showHeader && <Slot name="header"/>}
                    <Slot name="content"/>
                    {children}
                </div>
            ));

            const {rerender} = render(
                <ConditionalComponent showHeader={false}>
                    <Template slot="header">
                        <h1>Conditional Header</h1>
                    </Template>
                    <Template slot="content">
                        <p>Always visible</p>
                    </Template>
                </ConditionalComponent>
            );

            expect(screen.queryByText('Conditional Header')).toBeNull();
            expect(screen.getByText('Always visible')).not.toBeNull();

            rerender(
                <ConditionalComponent showHeader={true}>
                    <Template slot="header">
                        <h1>Conditional Header</h1>
                    </Template>
                    <Template slot="content">
                        <p>Always visible</p>
                    </Template>
                </ConditionalComponent>
            );

            expect(screen.getByText('Conditional Header')).not.toBeNull();
            expect(screen.getByText('Always visible')).not.toBeNull();
        });

        it('should work with dynamic slot names', () => {
            const DynamicComponent = hasSlots(({slotName, children}: PropsWithChildren<{ slotName: string }>) => (
                <div>
                    <Slot name={slotName} fallback={<p>No content</p>}/>
                    {children}
                </div>
            ));

            const {rerender} = render(
                <DynamicComponent slotName="dynamic">
                    <Template slot="dynamic">
                        <span>Dynamic content</span>
                    </Template>
                </DynamicComponent>
            );

            expect(screen.getByText(/Dynamic\s*content/)).not.toBeNull();

            rerender(
                <DynamicComponent slotName="other">
                    <Template slot="dynamic">
                        <span>Dynamic content</span>
                    </Template>
                </DynamicComponent>
            );

            expect(() => screen.getByText(/Dynamic\s*content/)).toThrow();
            expect(screen.getByText('No content')).not.toBeNull();
        });

        it('should handle empty templates', () => {
            const EmptyTemplateComponent = hasSlots(({children}: { children?: React.ReactNode }) => (
                <div>
                    <Slot name="empty" fallback={<p>Fallback</p>}/>
                    {children}
                </div>
            ));

            render(
                <EmptyTemplateComponent>
                    <Template slot="empty">
                        {null}
                    </Template>
                </EmptyTemplateComponent>
            );

            // Should render null (empty) instead of fallback
            expect(screen.queryByText('Fallback')).toBeNull();
        });
    });

    describe('Edge cases', () => {
        it('should handle components without any templates', () => {
            const NoTemplateComponent = hasSlots(({children}: { children?: React.ReactNode }) => (
                <div>
                    <p>Regular content</p>
                    <Slot name="missing"/>
                    {children}
                </div>
            ));

            render(<NoTemplateComponent/>);

            expect(screen.getByText('Regular content')).not.toBeNull();
        });

        it('should handle slots without names gracefully', () => {
            const InvalidSlotComponent = hasSlots(({children}: { children?: React.ReactNode }) => (
                <div>
                    <Slot name="" fallback={<p>Empty name fallback</p>}/>
                    {children}
                </div>
            ));

            render(<InvalidSlotComponent/>);

            expect(screen.getByText('Empty name fallback')).not.toBeNull();
        });

        it('should handle templates without slot names', () => {
            const NoSlotNameComponent = hasSlots(({children}: { children?: React.ReactNode }) => (
                <div>
                    <Slot name="test" fallback={<p>Fallback content</p>}/>
                    {children}
                </div>
            ));

            render(
                <NoSlotNameComponent>
                    <Template slot="">
                        <p>Empty slot name</p>
                    </Template>
                </NoSlotNameComponent>
            );

            // Should use fallback since template has empty slot name
            expect(screen.getByText('Fallback content')).not.toBeNull();
            expect(screen.queryByText('Empty slot name')).toBeNull();
        });
    });
});
