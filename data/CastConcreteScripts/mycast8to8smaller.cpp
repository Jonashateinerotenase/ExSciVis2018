#include <iostream>
#include <fstream>
#include <limits>
#include <vector>

int main() {

  std::string file = "Concrete_w1008_h1046_d687_c1_b8.raw";

  std::ifstream in(file, std::ios::binary | std::ios::ate);
  auto length = in.tellg();
  in.seekg(0, std::ios::beg);
  
  std::vector<unsigned char> data; //8 bit
  for (size_t d = 0; d < (687); ++d) 
  {
    for (size_t h = 0; h < (1046); ++h) 
    {
      for (size_t w = 0; w < (1008); ++w) 
      {


    unsigned char dE; //16 bit 1 148 701 632
    in.read((char*)&dE, sizeof(unsigned char));

    if(dE < 59)dE = 0;

    if((d % 2)+(h % 2)+(w % 2) == 0)data.push_back((unsigned char)dE);
}}
  }
  in.close();

  std::ofstream out("Concrete_w504_h523_d344_c1_b8.raw", std::ios::binary);
  out.write((char*)&data[0], data.size()*sizeof(char));
  out.close();


  return 0;
}
