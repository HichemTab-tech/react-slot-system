import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import React, {type PropsWithChildren} from 'react';
import {hasSlots, Slot, Template} from '../src';

describe('React Slot System - Core Functionality', () => {

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

            render(<EnhancedComponent title="Test Title"/>);
            expect(screen.getByText('Test Title')).not.toBeNull();
        });

        it('should work with components that accept children', () => {
            const BaseComponent = ({title, children}: PropsWithChildren<{ title: string }>) => (
                <div>
                    <h1>{title}</h1>
                    <div className="content">{children}</div>
                    <Slot name="extra"/>
                </div>
            );

            const EnhancedComponent = hasSlots(BaseComponent);

            render(
                <EnhancedComponent title="Test">
                    <p>Child content</p>
                </EnhancedComponent>
            );

            expect(screen.getByText('Test')).not.toBeNull();
            expect(screen.getByText('Child content')).not.toBeNull();
        });
    });

    describe('Slot rendering', () => {
        it('should render nothing when no template is provided and no fallback', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="empty"/>
                    <p>Always visible</p>
                    {children}
                </div>
            ));

            render(<Component/>);
            expect(screen.getByText('Always visible')).not.toBeNull();
            // The empty slot should not add any text content
        });

        it('should render fallback when no template is provided', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="missing" fallback={<span>Fallback text</span>}/>
                    {children}
                </div>
            ));

            render(<Component/>);
            expect(screen.getByText('Fallback text')).not.toBeNull();
        });

        it('should render template content when provided', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="header"/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="header">
                        <h1>Template Header</h1>
                    </Template>
                    <p>Main content</p>
                </Component>
            );

            expect(screen.getByText('Template Header')).not.toBeNull();
            expect(screen.getByText('Main content')).not.toBeNull();
        });

        it('should prefer template over fallback', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="content" fallback={<span>Fallback</span>}/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="content">
                        <span>Template content</span>
                    </Template>
                </Component>
            );

            expect(screen.getByText('Template content')).not.toBeNull();
            expect(screen.queryByText('Fallback')).toBeNull();
        });
    });

    describe('Template behavior', () => {
        it('should not render template component directly', () => {
            const {container} = render(
                <Template slot="test">
                    <div>Should not appear</div>
                </Template>
            );

            expect(container.firstChild).toBeNull();
        });

        it('should handle multiple templates for different slots', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="first"/>
                    <Slot name="second"/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="first">
                        <span>First slot</span>
                    </Template>
                    <Template slot="second">
                        <span>Second slot</span>
                    </Template>
                </Component>
            );

            expect(screen.getByText('First slot')).not.toBeNull();
            expect(screen.getByText('Second slot')).not.toBeNull();
        });

        it('should handle template override (last wins)', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="override"/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="override">
                        <span>First</span>
                    </Template>
                    <Template slot="override">
                        <span>Second</span>
                    </Template>
                </Component>
            );

            expect(screen.queryByText('First')).toBeNull();
            expect(screen.getByText('Second')).not.toBeNull();
        });
    });

    describe('Complex scenarios', () => {
        it('should work with nested JSX in templates', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="complex"/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="complex">
                        <div>
                            <h2>Title</h2>
                            <ul>
                                <li>Item A</li>
                                <li>Item B</li>
                            </ul>
                        </div>
                    </Template>
                </Component>
            );

            expect(screen.getByText('Title')).not.toBeNull();
            expect(screen.getByText('Item A')).not.toBeNull();
            expect(screen.getByText('Item B')).not.toBeNull();
        });

        it('should handle conditional slot rendering', () => {
            const Component = hasSlots(({showSlot, children}: PropsWithChildren<{
                showSlot: boolean
            }>) => (
                <div>
                    {showSlot && <Slot name="conditional"/>}
                    {children}
                </div>
            ));

            const {rerender} = render(
                <Component showSlot={false}>
                    <Template slot="conditional">
                        <span>Conditional content</span>
                    </Template>
                </Component>
            );

            expect(screen.queryByText('Conditional content')).toBeNull();

            rerender(
                <Component showSlot={true}>
                    <Template slot="conditional">
                        <span>Conditional content</span>
                    </Template>
                </Component>
            );

            expect(screen.getByText('Conditional content')).not.toBeNull();
        });

        it('should handle empty template content', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="empty" fallback={<span>Fallback</span>}/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="empty">
                        {null}
                    </Template>
                </Component>
            );

            // Template with null should still override fallback
            expect(screen.queryByText('Fallback')).toBeNull();
        });
    });

    describe('Edge cases', () => {
        it('should handle empty slot names', () => {
            const Component = hasSlots(() => (
                <div>
                    <Slot name="" fallback={<span>Empty name</span>}/>
                </div>
            ));

            render(<Component/>);
            expect(screen.getByText('Empty name')).not.toBeNull();
        });

        it('should handle empty template slot names', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="test" fallback={<span>Fallback</span>}/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="">
                        <span>Empty slot</span>
                    </Template>
                </Component>
            );

            // Template with empty slot name shouldn't match "test" slot
            expect(screen.getByText('Fallback')).not.toBeNull();
            expect(screen.queryByText('Empty slot')).toBeNull();
        });

        it('should work with components that have no templates', () => {
            const Component = hasSlots(() => (
                <div>
                    <span>No slots here</span>
                </div>
            ));

            render(<Component/>);
            expect(screen.getByText('No slots here')).not.toBeNull();
        });
    });
});
