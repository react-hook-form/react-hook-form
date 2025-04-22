# Contributing to `React Hook Form`

As a fan, user and contributor of `react-hook-form`, I want to help the library continue to grow and evolve. I encourage everyone to help and support this library by contributing.

## Code contributions

Here is a quick guide to doing code contributions to the library.

1. Fork and clone the repo to your local machine `git clone https://github.com/YOUR_GITHUB_USERNAME/rhf-plus.git`

2. Create a new branch from `master` with a meaningful name for a new feature or an issue you want to work on: `git checkout -b feature/your-awesome-feature-name`

3. Install packages by running:

   ```shellscript
   pnpm install
   ```

> Pay attention that we use pnpm v10 along with Node.js 22.

4. If you've added a code that should be tested, ensure the test suite still passes.

   ```shellscript
   pnpm test && pnpm tsd
   ```

5. Try to write some unit tests to cover as much of your code as possible.

6. Ensure your code lints without errors.

   ```shellscript
   pnpm lint
   ```

7. Ensure the automation suite passes by running two following commands in parallel:

   ```shellscript
   pnpm start
   # In another terminal, while 'start' runs:
   pnpm e2e
   ```

8. Ensure build passes.

   ```shellscript
   pnpm build
   ```

9. Ensure exports are documented. (requires build)

   ```shellscript
   pnpm api-extractor
   ```

10. Push your branch: `git push -u origin feature/your-awesome-feature-name`

11. Submit a pull request to the upstream `rhf-plus` repository.

12. Choose a descriptive title and describe your changes briefly.

## Coding style

Please follow the coding style of the project. React Hook Form uses eslint and prettier. If possible, enable their respective plugins in your editor to get real-time feedback. The linting can be run manually with the following command: `pnpm lint:fix` and `pnpm prettier:fix`

## Visual Debugging Jest

### Use `jest-preview`

You can use [Jest Preview](https://www.jest-preview.com) to debug the Jest tests visually.

1. Put `debug()` to wherever you want to preview the UI of your Jest tests

```diff
import { debug } from 'jest-preview';

it('should render correctly', () => {
  render(<Component />);
  fireEvent.click(screen.getByRole('button');

+ debug();
});
```

2. Open Jest Preview Dashboard

   ```shellscript
   pnpm jest-preview
   ```

3. Run the tests

   ```shellscript
   pnpm test:watch
   ```

The browser will reloads automatically when `debug()` is executed.

[Automatic Mode](https://www.jest-preview.com/blog/automatic-mode/) is also enabled, it will preview the UI of a failed test on the browser automatically without explicitly adding `debug()`.

### Write a new test

To write a new test efficiently, add `debug()` at the end of `it`'s callback block. Whenever you hit Save, the corresponding UI updated in a browser instantly.

You can remove `debug()` after you have finished writing the tests.

```js
import { debug } from 'jest-preview';

it('should render correctly', () => {
  // Write your tests here
  // Whenever you hit Save, the UI updated in a browser instantly

  debug(); // <-- add this line at the end of `it` block
});
```

## License

By contributing your code to the `rhf-plus` GitHub repository, you agree to license your contribution under the MIT license.
