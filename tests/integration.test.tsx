import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import React, {type PropsWithChildren} from 'react';
import {hasSlots, Slot, Template} from '../src';

describe('React Slot System - Integration Tests', () => {

    it('should recreate the demo app functionality', () => {
        // Recreate a simplified version of the demo app
        const Card = hasSlots(({title, children}: PropsWithChildren<{ title?: string }>) => (
            <div className="card">
                <Slot name="header" fallback={title ? <h2>{title}</h2> : null}/>
                <div className="content">
                    {children}
                </div>
                <Slot name="footer"/>
            </div>
        ));

        render(
            <Card title="Default Title">
                <Template slot="header">
                    <h1>Custom Header</h1>
                </Template>

                <p>This is the main card content</p>

                <Template slot="footer">
                    <div>
                        <button>Save</button>
                        <button>Cancel</button>
                    </div>
                </Template>
            </Card>
        );

        // Verify all parts are rendered correctly
        expect(screen.getByText('Custom Header')).not.toBeNull();
        expect(screen.getByText('This is the main card content')).not.toBeNull();
        expect(screen.getByText('Save')).not.toBeNull();
        expect(screen.getByText('Cancel')).not.toBeNull();

        // Verify fallback is not used when template is provided
        expect(screen.queryByText('Default Title')).toBeNull();
    });

    it('should work with layout pattern like in the README', () => {
        const Layout = hasSlots(({children}: PropsWithChildren) => (
            <div className="layout">
                <header>
                    <Slot name="header" fallback={<h1>Default Header</h1>}/>
                </header>

                <main>{children}</main>

                <aside>
                    <Slot name="sidebar"/>
                </aside>

                <footer>
                    <Slot name="footer"/>
                </footer>
            </div>
        ));

        render(
            <Layout>
                <Template slot="header">
                    <nav>Custom Navigation</nav>
                </Template>

                <Template slot="sidebar">
                    <div>Sidebar content</div>
                </Template>

                <div>Main page content goes here</div>

                <Template slot="footer">
                    <p>&copy; 2024 My App</p>
                </Template>
            </Layout>
        );

        expect(screen.getByText('Custom Navigation')).not.toBeNull();
        expect(screen.getByText('Sidebar content')).not.toBeNull();
        expect(screen.getByText('Main page content goes here')).not.toBeNull();
        expect(screen.getByText('© 2024 My App')).not.toBeNull();

        // Verify fallback is not used
        expect(screen.queryByText('Default Header')).toBeNull();
    });

    it('should work with modal/dialog pattern', () => {
        const Dialog = hasSlots(({
                                     isOpen,
                                     onClose,
                                     children
                                 }: PropsWithChildren<{
            isOpen: boolean;
            onClose: () => void;
        }>) => {
            if (!isOpen) return null;

            return (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <Slot name="title" fallback="Dialog"/>
                            <button onClick={onClose}>×</button>
                        </div>

                        <div className="modal-body">
                            {children}
                        </div>

                        <div className="modal-footer">
                            <Slot name="actions" fallback={
                                <button onClick={onClose}>Close</button>
                            }/>
                        </div>
                    </div>
                </div>
            );
        });

        const mockClose = vi.fn();

        render(
            <Dialog isOpen={true} onClose={mockClose}>
                <Template slot="title">
                    <h2>Confirm Action</h2>
                </Template>

                <p>Are you sure you want to delete this item?</p>

                <Template slot="actions">
                    <button onClick={() => console.log('delete')}>Delete</button>
                    <button onClick={mockClose}>Cancel</button>
                </Template>
            </Dialog>
        );

        expect(screen.getByText('Confirm Action')).not.toBeNull();
        expect(screen.getByText('Are you sure you want to delete this item?')).not.toBeNull();
        expect(screen.getByText('Delete')).not.toBeNull();
        expect(screen.getByText('Cancel')).not.toBeNull();
        expect(screen.getByText('×')).not.toBeNull();

        // Verify fallbacks are not used
        expect(screen.queryByText('Dialog')).toBeNull();
        expect(screen.queryByText('Close')).toBeNull();
    });

    it('should handle all exports from the library', () => {
        // Test that all main exports are available and functional
        const TestComponent = hasSlots(({children}: PropsWithChildren) => (
            <div>
                <Slot name="test" fallback={<span>No template</span>}/>
                {children}
            </div>
        ));

        // Test without template (fallback should show)
        const {rerender} = render(<TestComponent/>);
        expect(screen.getByText('No template')).not.toBeNull();

        // Test with template (should override fallback)
        rerender(
            <TestComponent>
                <Template slot="test">
                    <span>Has template</span>
                </Template>
            </TestComponent>
        );

        expect(screen.getByText('Has template')).not.toBeNull();
        expect(screen.queryByText('No template')).toBeNull();
    });

    it('should maintain type safety in real usage', () => {
        // This test verifies that TypeScript compilation works correctly
        interface CardProps {
            title: string;
            variant?: 'primary' | 'secondary';
            disabled?: boolean;
        }

        const TypedCard = hasSlots(({
                                        title,
                                        variant = 'primary',
                                        disabled = false,
                                        children
                                    }: PropsWithChildren<CardProps>) => (
            <div className={`card card--${variant}`} style={{opacity: disabled ? 0.5 : 1}}>
                <Slot name="header" fallback={<h3>{title}</h3>}/>
                <Slot name="content"/>
                <Slot name="actions"/>
                {children}
            </div>
        ));

        render(
            <TypedCard title="Test Card" variant="secondary" disabled={false}>
                <Template slot="content">
                    <p>Card content here</p>
                </Template>
                <Template slot="actions">
                    <button>Action</button>
                </Template>
            </TypedCard>
        );

        // Should use fallback for header since no template provided
        expect(screen.getByText('Test Card')).not.toBeNull();
        expect(screen.getByText('Card content here')).not.toBeNull();
        expect(screen.getByText('Action')).not.toBeNull();
    });
});
