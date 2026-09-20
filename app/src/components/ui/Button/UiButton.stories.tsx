import type { Meta, StoryObj } from '@storybook/react';
import {withRouter} from 'storybook-addon-react-router-v6';
import {FC} from 'react';
import UiButton  from './UiButton.tsx';
import '../../../styles.scss';
import {Colors, Rounded, Sizes} from '../../../types/types.ts';

interface Props {
    color: Colors;
    size: Sizes;
    rounded: Rounded;
}

const UiButtonStories: FC<Props> = ({color, size, rounded})  => {
    return (
        <>
            <UiButton color={color} size={size} rounded={rounded}>Primary Button</UiButton>
        </>
    );
};

const meta = {
    title: 'Example/Button',
    component: UiButtonStories,
    decorators: [withRouter],
    tags: ['autodocs'],
    parameters: {
    },
    argTypes: {
        color: {
            control: 'select',
            options: [
                'primary',
                'secondary',
                'success',
                'danger',
                'warning',
                'info',
                'red',
                'purple',
                'blue',
                'pink',
                'green',
                'yellow',
                'white',
                'black',
            ],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        rounded: {
            control: 'select',
            options: ['none', 'sm', 'md', 'lg', 'full'],
        },
    }
} satisfies Meta<typeof UiButtonStories>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonCollection: Story = {
    args: {
        color: 'primary',
        size: 'md',
        rounded: 'md',
    }
};
