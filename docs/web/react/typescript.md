
# Typescript

## Useful React Prop Type Examples

```typescript
export declare interface AppProps {
  
  // best, accepts everything React can render
  children?: React.ReactNode; 
  
  // A single React element
  childrenElement: JSX.Element; 
  
  // to pass through style props
  style?: React.CSSProperties; 
  
  // form events! the generic parameter is
  onChange?: React.FormEventHandler<HTMLInputElement>; 
  
  // to impersonate all the props of a button element and explicitly not forwarding its ref
  props: Props & React.ComponentPropsWithoutRef<'button'>; 
  
  // to impersonate all the props of MyButtonForwardedRef and explicitly forwarding its ref
  props2: Props & React.ComponentPropsWithRef<MyButtonWithForwardRef>; 
}
```
