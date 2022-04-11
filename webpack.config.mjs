import path from 'path'

export default {
  entry: './src/app/index.tsx',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  output: {
    path: path.join(process.cwd(), './lib/app/'),
    filename: 'bundle.min.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: [
          path.join(process.cwd(), 'node_modules'),
          path.join(process.cwd(), 'src/**'),
        ],
        options: {
          compilerOptions: {
            resolveJsonModule: true,
          },
        },
      },
    ],
  },
}
